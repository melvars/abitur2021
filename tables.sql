CREATE TABLE IF NOT EXISTS theme(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    main VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,

    UNIQUE KEY main (main, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TODO: Remove dropping
-- DROP TABLE IF EXISTS motto_votes;
-- DROP TABLE IF EXISTS mottos;
-- DROP TABLE IF EXISTS quotes;
-- DROP TABLE IF EXISTS ranking_questions;
-- DROP TABLE IF EXISTS ranking_answers;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS types;
-- DROP TABLE IF EXISTS class;

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
    username VARCHAR(255) NOT NULL UNIQUE,
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

CREATE TABLE IF NOT EXISTS ranking_questions(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    type_id INTEGER NOT NULL,

    UNIQUE KEY uk_question (question, type_id),
    CONSTRAINT `fk_type_question` FOREIGN KEY (type_id) REFERENCES types (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS ranking_answers(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Submitter
    answer_id INTEGER NOT NULL, -- Selected pupil

    UNIQUE KEY uk_answer (question_id, user_id),
    CONSTRAINT `fk_question_answer` FOREIGN KEY (question_id) REFERENCES users (id),
    CONSTRAINT `fk_user_answer1` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_user_answer2` FOREIGN KEY (answer_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS mottos(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    
    UNIQUE KEY main (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS motto_votes(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    motto_id INTEGER NOT NULL,
    votes SMALLINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE KEY uk_vote (user_id, motto_id),
    CONSTRAINT `fk_voted_user` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_voted_vote` FOREIGN KEY (motto_id) REFERENCES mottos (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
