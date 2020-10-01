CREATE TABLE IF NOT EXISTS theme(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    main VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,

    UNIQUE KEY main (main, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TODO: Remove dropping
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS types;
DROP TABLE IF EXISTS class;

CREATE TABLE IF NOT EXISTS types(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS class(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    middlename VARCHAR(255) DEFAULT NULL,
    surname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    class_id INTEGER NOT NULL,
    type_id INTEGER NOT NULL,

    UNIQUE KEY uk_name (name, middlename, surname),
    CONSTRAINT `fk_class_user` FOREIGN KEY (class_id) REFERENCES class (id),
    CONSTRAINT `fk_type_user` FOREIGN KEY (type_id) REFERENCES types (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS quotes(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL, -- Person who heard it
    author_id INTEGER NOT NULL, -- Person who said it
    quote VARCHAR(255) NOT NULL,

    UNIQUE KEY uk_quote (author_id, quote),
    CONSTRAINT `fk_user_quote1` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_user_quote2` FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO types VALUES (1, "teacher"), (2, "pupil");
INSERT INTO class VALUES
    (1, "TGM13.1"),
    (2, "TGM13.2"),
    (3, "TGTM13.1"),
    (4, "TGI13.1"),
    (5, "TGI13.2");