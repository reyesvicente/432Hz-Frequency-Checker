This project checks if the frequency of a song is 432Hz or not.

## Run the backend:
```bash
python -m venv env
source env/bin/activate
python -m pip install requirements.txt
uvicorn main:app --reload
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```