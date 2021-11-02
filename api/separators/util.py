import requests
from tqdm import tqdm


def download_file(url, target):
    def _download():
        response = requests.get(url, stream=True)
        content_type = response.headers.get('Content-Type', None)
        if content_type is None or content_type  == 'text/html':
            raise ValueError(f'Invalid model URL: {url}')

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

def download_and_verify(model_url, model_dir, model_file_path, force=False):
    if force or not model_file_path.is_file():
        model_dir.mkdir(exist_ok=True, parents=True)
        print("Downloading pre-trained model, this could take a while...")
        download_file(model_url, model_file_path)
