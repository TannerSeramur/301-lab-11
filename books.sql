DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn BIGINT,
    image_url VARCHAR(255),
    bookDescription VARCHAR(1000),
    bookshelf VARCHAR(255)
);
