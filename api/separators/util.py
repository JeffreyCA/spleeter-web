import requests
import validators
from tqdm import tqdm
from validators.utils import ValidationFailure


def is_valid_url(url):
    try:
        validators.url(url)
        return True
    except ValidationFailure:
        pass
    return False

def download_file(url, target):
    def _download():
        response = requests.get(url, stream=True)
        total_length = int(response.headers.get('content-length', 0))

        with tqdm(total=total_length, ncols=120, unit="B",
                  unit_scale=True) as bar:
            with open(target, "wb") as output:
                for data in response.iter_content(chunk_size=4096):
                    output.write(data)
                    bar.update(len(data))

    try:
        _download()
    except:
        if target.exists():
            target.unlink()
        raise

def download_and_verify(model_url, model_dir, model_file_path):
    if not model_file_path.is_file():
        model_dir.mkdir(exist_ok=True, parents=True)
        print("Downloading pre-trained model, this could take a while...")
        download_file(model_url, model_file_path)
