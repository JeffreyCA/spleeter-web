# Spleeter Web

## Getting Started
1. Start backend and frontend servers:
    ```sh
    > python3 -m venv env
    > source env/bin/activate
    > pip install -r requirements.txt
    > npm run dev
    ```

2. Start Huey worker (in a separate session):
    ```sh
    > source env/bin/activate
    > python manage.py run_huey
    ```
