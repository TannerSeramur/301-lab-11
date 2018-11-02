DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    author VARCHAR(255),
    isbn BIGINT,
    image_url VARCHAR(255),
    bookDescription TEXT,
    bookshelf VARCHAR(255)
);
