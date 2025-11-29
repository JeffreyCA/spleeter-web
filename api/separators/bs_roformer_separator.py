import gc
import subprocess
from pathlib import Path
from typing import Dict

import numpy as np
import torch
import torch.nn as nn
import yaml
from omegaconf import OmegaConf
from spleeter.audio.adapter import AudioAdapter
from tqdm import tqdm

from api.models import OutputFormat
from api.util import output_format_to_ext, is_output_format_lossy
from .bs_roformer import BSRoformer

"""
This module defines a wrapper interface over the BS-RoFormer model for music source separation.

Code adapted from https://github.com/Anjok07/ultimatevocalremovergui/blob/v5.6.0_roformer_add%2Bdirectml/separate.py which is copyrighted under the terms of the MIT license.
"""

# Hugging Face repository URL
HF_REPO_ID = 'jarredou/BS-ROFO-SW-Fixed'
HF_REVISION = 'f99fc5c2e4bc201413cfc1ca5767cf62ddb1a9a4'

# Default paths for model files
DEFAULT_MODEL_DIR = Path('pretrained_models/bs_roformer')
DEFAULT_MODEL_PATH = DEFAULT_MODEL_DIR / 'BS-Rofo-SW-Fixed.ckpt'
DEFAULT_CONFIG_PATH = DEFAULT_MODEL_DIR / 'BS-Rofo-SW-Fixed.yaml'


def try_download_model(model_dir: Path = DEFAULT_MODEL_DIR,
                              model_path: Path = DEFAULT_MODEL_PATH,
                              config_path: Path = DEFAULT_CONFIG_PATH):
    """
    Download BS-RoFormer model from Hugging Face if not already present.
    Uses huggingface cli to fetch the repository.
    """

    print(f'Downloading BS-RoFormer model from {HF_REPO_ID} if needed...')
    
    # Create parent directory if needed
    model_dir.parent.mkdir(parents=True, exist_ok=True)
    
    # Download using huggingface cli - no-ops if already present
    try:
        subprocess.run(
            ['hf', 'download', HF_REPO_ID, '--revision', HF_REVISION, '--local-dir', str(model_dir)],
            check=True
        )
        # print(f'Successfully downloaded BS-RoFormer model to {model_dir}')
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f'Failed to download BS-RoFormer model') from e


def load_config(config_path):
    """Load YAML config with support for !!python/tuple tags."""
    with open(config_path, 'r') as f:
        # Use UnsafeLoader to support !!python/tuple tags
        config = yaml.load(f, Loader=yaml.UnsafeLoader)
    # Convert to OmegaConf for convenient attribute access
    return OmegaConf.create(config)


class BSRoformerSeparator:
    """Performs source separation using BS-RoFormer model."""
    
    # Stem order from the model config (training.instruments)
    # The model outputs 6 stems: bass, drums, other, vocals, guitar, piano
    # We can output 4, 5, or 6 stems depending on stem_mode
    STEM_NAMES = ['bass', 'drums', 'other', 'vocals', 'guitar', 'piano']
    
    # Stem modes
    STEM_MODE_4 = '4stem'           # bass, drums, other (incl guitar+piano), vocals
    STEM_MODE_5_GUITAR = '5stem_guitar'  # bass, drums, other (incl piano), vocals, guitar
    STEM_MODE_5_PIANO = '5stem_piano'    # bass, drums, other (incl guitar), vocals, piano
    STEM_MODE_6 = '6stem'           # bass, drums, other, vocals, guitar, piano
    
    def __init__(self,
                 model_path=None,
                 config_path=None,
                 cpu_separation=False,  # Default to GPU as per user request
                 output_format=OutputFormat.MP3_256.value,
                 batch_size=1,
                 overlap=2,
                 stem_mode='4stem'):
        """
        Initialize BS-RoFormer separator.
        
        :param model_path: Path to .ckpt checkpoint file
        :param config_path: Path to .yaml config file
        :param cpu_separation: Use CPU for inference (default: False for GPU)
        :param output_format: Output audio format
        :param batch_size: Batch size for inference
        :param overlap: Number of overlapping segments
        :param stem_mode: Output stem configuration ('4stem', '5stem_guitar', '5stem_piano', '6stem')
        """
        self.model_path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
        self.config_path = Path(config_path) if config_path else DEFAULT_CONFIG_PATH
        
        self.device = 'cpu' if cpu_separation else 'cuda'
        self.sample_rate = 44100
        self.batch_size = batch_size
        self.overlap = overlap
        self.stem_mode = stem_mode
        
        # Output format settings
        self.audio_bitrate = f'{output_format}k' if is_output_format_lossy(output_format) else None
        self.audio_format = output_format_to_ext(output_format)
        self.audio_adapter = AudioAdapter.default()
        
        # Config will be loaded lazily in get_model after download
        self.config = None
        
    def get_model(self):
        """Load BS-RoFormer model from checkpoint."""
        # Download model if not present
        try_download_model(DEFAULT_MODEL_DIR, self.model_path, self.config_path)
        
        # Load config if not already loaded
        if self.config is None:
            self.config = load_config(self.config_path)
        
        # Convert config to dict and handle tuple conversion
        model_config = OmegaConf.to_container(self.config.model, resolve=True)
        
        # Ensure freqs_per_bands is a tuple (OmegaConf may load as list)
        if 'freqs_per_bands' in model_config and isinstance(model_config['freqs_per_bands'], list):
            model_config['freqs_per_bands'] = tuple(model_config['freqs_per_bands'])
        
        # Ensure multi_stft_resolutions_window_sizes is a tuple
        if 'multi_stft_resolutions_window_sizes' in model_config and isinstance(model_config['multi_stft_resolutions_window_sizes'], list):
            model_config['multi_stft_resolutions_window_sizes'] = tuple(model_config['multi_stft_resolutions_window_sizes'])
        
        # Instantiate model from config
        model = BSRoformer(**model_config)
        
        # Load checkpoint
        checkpoint = torch.load(self.model_path, map_location='cpu')
        model.load_state_dict(checkpoint)
        model.to(self.device).eval()
        
        return model
    
    def demix(self, mix: np.ndarray, model) -> Dict[str, np.ndarray]:
        """
        Separate audio mixture into stems using BS-RoFormer.
        
        :param mix: Input audio as numpy array (channels, samples)
        :param model: Loaded BS-RoFormer model
        :return: Dictionary mapping stem names to separated audio arrays
        """
        device = self.device
        
        # Get inference parameters from config
        segment_size = self.config.inference.dim_t
        # Use model's stft_hop_length for segment calculation (not audio.hop_length)
        hop_length = self.config.model.stft_hop_length
        C = hop_length * (segment_size - 1)
        N = self.config.inference.num_overlap
        step = int(C // N)
        fade_size = C // 10
        batch_size = self.config.inference.batch_size
        
        # Convert to tensor
        mix_tensor = torch.tensor(mix, dtype=torch.float32)
        length_init = mix_tensor.shape[-1]
        
        # Padding for border effects
        if length_init > 2 * (C - step) and (C - step > 0):
            mix_tensor = nn.functional.pad(mix_tensor, (C - step, C - step), mode='reflect')
        
        # Set up windows for fade-in/out
        fadein = torch.linspace(0, 1, fade_size).to(device)
        fadeout = torch.linspace(1, 0, fade_size).to(device)
        window_start = torch.ones(C).to(device)
        window_middle = torch.ones(C).to(device)
        window_finish = torch.ones(C).to(device)
        window_start[-fade_size:] *= fadeout
        window_finish[:fade_size] *= fadein
        window_middle[:fade_size] *= fadein
        window_middle[-fade_size:] *= fadeout
        
        # Number of stems
        S = len(self.config.training.instruments)
        
        # Calculate total number of segments for progress bar
        total_segments = 0
        pos = 0
        while pos < mix_tensor.shape[1]:
            total_segments += 1
            pos += step
        
        with torch.inference_mode():
            req_shape = (S,) + tuple(mix_tensor.shape)
            result = torch.zeros(req_shape, dtype=torch.float32, device=device)
            counter = torch.zeros(req_shape, dtype=torch.float32, device=device)
            batch_data = []
            batch_locations = []
            
            i = 0
            with tqdm(total=total_segments, desc='Separating', unit='segment', ncols=120) as pbar:
                while i < mix_tensor.shape[1]:
                    part = mix_tensor[:, i:i + C].to(device)
                    length = part.shape[-1]
                    if length < C:
                        if length > C // 2 + 1:
                            part = nn.functional.pad(part, (0, C - length), mode='reflect')
                        else:
                            part = nn.functional.pad(part, (0, C - length, 0, 0), mode='constant', value=0)
                    
                    batch_data.append(part)
                    batch_locations.append((i, length))
                    i += step
                    
                    # Process in batches
                    if len(batch_data) >= batch_size or (i >= mix_tensor.shape[1]):
                        arr = torch.stack(batch_data, dim=0)
                        x = model(arr)
                        
                        for j in range(len(batch_locations)):
                            start, l = batch_locations[j]
                            window = window_middle
                            if start == 0:
                                window = window_start
                            elif i >= mix_tensor.shape[1]:
                                window = window_finish
                            
                            result[..., start:start + l] += x[j][..., :l] * window[..., :l]
                            counter[..., start:start + l] += window[..., :l]
                        
                        # Update progress bar
                        pbar.update(len(batch_data))
                        batch_data = []
                        batch_locations = []
            
            # Normalize by overlap counter
            estimated_sources = result / counter.clamp(min=1e-10)
            
            # Remove padding
            if length_init > 2 * (C - step) and (C - step > 0):
                estimated_sources = estimated_sources[..., (C - step):-(C - step)]
        
        # Convert to dict mapping stem names to numpy arrays
        sources = {}
        instruments = self.config.training.instruments
        for idx, name in enumerate(instruments):
            sources[name] = estimated_sources[idx].cpu().numpy()
        
        return sources
    
    def _combine_stems_for_4_output(self, sources: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Combine 6-stem output to 4-stem output by merging guitar and piano into other.
        
        :param sources: Dictionary with 6 stems (bass, drums, other, vocals, guitar, piano)
        :return: Dictionary with 4 stems (bass, drums, other, vocals)
        """
        result = {
            'vocals': sources['vocals'],
            'drums': sources['drums'],
            'bass': sources['bass'],
            # Combine other + guitar + piano into "other"
            'other': sources['other'] + sources['guitar'] + sources['piano']
        }
        return result
    
    def _combine_stems_for_5_output_guitar(self, sources: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Combine 6-stem output to 5-stem output with guitar as separate stem (piano merged into other).
        
        :param sources: Dictionary with 6 stems (bass, drums, other, vocals, guitar, piano)
        :return: Dictionary with 5 stems (bass, drums, other, vocals, guitar)
        """
        result = {
            'vocals': sources['vocals'],
            'drums': sources['drums'],
            'bass': sources['bass'],
            'guitar': sources['guitar'],
            # Combine other + piano into "other"
            'other': sources['other'] + sources['piano']
        }
        return result
    
    def _combine_stems_for_5_output_piano(self, sources: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Combine 6-stem output to 5-stem output with piano as separate stem (guitar merged into other).
        
        :param sources: Dictionary with 6 stems (bass, drums, other, vocals, guitar, piano)
        :return: Dictionary with 5 stems (bass, drums, other, vocals, piano)
        """
        result = {
            'vocals': sources['vocals'],
            'drums': sources['drums'],
            'bass': sources['bass'],
            'piano': sources['piano'],
            # Combine other + guitar into "other"
            'other': sources['other'] + sources['guitar']
        }
        return result
    
    def _get_output_stems(self, sources: Dict[str, np.ndarray]) -> Dict[str, np.ndarray]:
        """
        Get output stems based on stem_mode.
        
        :param sources: Dictionary with 6 stems from model
        :return: Dictionary with combined stems based on stem_mode
        """
        if self.stem_mode == self.STEM_MODE_4:
            return self._combine_stems_for_4_output(sources)
        elif self.stem_mode == self.STEM_MODE_5_GUITAR:
            return self._combine_stems_for_5_output_guitar(sources)
        elif self.stem_mode == self.STEM_MODE_5_PIANO:
            return self._combine_stems_for_5_output_piano(sources)
        elif self.stem_mode == self.STEM_MODE_6:
            # Return all 6 stems without combining
            return sources
        else:
            # Default to 4-stem
            return self._combine_stems_for_4_output(sources)
    
    def create_static_mix(self, parts: Dict[str, bool], input_path: str, output_path: Path):
        """
        Create a static mix by performing source separation and combining selected stems.
        
        :param parts: Dict mapping stem names to booleans indicating if they should be included
        :param input_path: Path to source file
        :param output_path: Path to output file
        """
        input_path = Path(input_path)
        model = self.get_model()
        
        # Load audio
        waveform, _ = self.audio_adapter.load(str(input_path), sample_rate=self.sample_rate)
        
        # Convert to (channels, samples) format for model
        # AudioAdapter returns (samples, channels)
        mix = waveform.T
        
        # Separate into 6 stems
        sources_6 = self.demix(mix, model)
        
        # Get output stems based on stem_mode
        output_sources = self._get_output_stems(sources_6)
        
        # Free GPU memory
        del model
        torch.cuda.empty_cache()
        gc.collect()
        
        # Combine selected parts
        final_source = None
        for stem_name, include in parts.items():
            if not include:
                continue
            if stem_name in output_sources:
                source = output_sources[stem_name]
                final_source = source if final_source is None else final_source + source
        
        # Convert back to (samples, channels) for saving
        final_source = final_source.T
        
        print(f'Exporting to {output_path}...')
        self.audio_adapter.save(str(output_path), final_source, self.sample_rate,
                                self.audio_format, self.audio_bitrate)
    
    def separate_into_parts(self, input_path: str, output_path: str):
        """
        Separate audio into individual stem files.
        
        :param input_path: Input audio file path
        :param output_path: Output directory path
        """
        input_path = Path(input_path)
        output_path = Path(output_path)
        
        model = self.get_model()
        
        # Load audio
        waveform, _ = self.audio_adapter.load(str(input_path), sample_rate=self.sample_rate)
        
        # Convert to (channels, samples) format for model
        mix = waveform.T
        
        # Separate into 6 stems
        sources_6 = self.demix(mix, model)
        
        # Get output stems based on stem_mode
        output_sources = self._get_output_stems(sources_6)
        
        # Free GPU memory
        del model
        torch.cuda.empty_cache()
        gc.collect()
        
        # Export all stems
        for stem_name, source in output_sources.items():
            # Convert to (samples, channels) for saving
            source_transposed = source.T
            filename = f'{stem_name}.{self.audio_format}'
            stem_path = output_path / filename
            
            print(f'Exporting {filename}...')
            self.audio_adapter.save(str(stem_path), source_transposed, self.sample_rate,
                                    self.audio_format, self.audio_bitrate)
