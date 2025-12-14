FROM python:3.9-slim

WORKDIR /app

# Install Flask and Requests (for talking to backend)
# Flask is assumed. If you used other libs, add them.
RUN pip install flask requests

COPY . .

CMD ["python", "app.py"]
