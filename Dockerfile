FROM python:3.9

WORKDIR /app

COPY ./Pipfile /app/Pipfile
COPY ./Pipfile.lock /app/Pipfile.lock

RUN pip install pipenv
RUN pipenv install --system --deploy

COPY ./backend /app/src

VOLUME /app/src

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]

# If running behind a proxy like Nginx or Traefik add --proxy-headers
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80", "--proxy-headers"]