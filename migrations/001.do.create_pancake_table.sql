CREATE TABLE users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_name VARCHAR (255) UNIQUE NOT NULL,
    password VARCHAR (225) NOT NULL
);

CREATE TABLE favorites (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    users_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL, 
    book_title VARCHAR (225) NOT NULL,
    book_author VARCHAR (225) NOT NULL,
    book_image VARCHAR (225) NOT NULL,
    book_description TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE
);




CREATE TABLE pancake (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);