CREATE TABLE IF NOT EXISTS types
(
    id   INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS class
(
    id   INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS users
(
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    username   VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    middlename VARCHAR(255) DEFAULT NULL,
    surname    VARCHAR(255) NOT NULL,
    password   VARCHAR(255) NOT NULL,
    class_id   INTEGER      NOT NULL,
    type_id    INTEGER      NOT NULL,
    is_admin   BOOLEAN      DEFAULT FALSE,

    UNIQUE KEY uk_name (name, middlename, surname),
    CONSTRAINT `fk_class_user` FOREIGN KEY (class_id) REFERENCES class (id),
    CONSTRAINT `fk_type_user` FOREIGN KEY (type_id) REFERENCES types (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS quotes
(
    id        INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id   INTEGER      NOT NULL, -- Person who heard it
    author_id INTEGER      NOT NULL, -- Person who said it
    quote     VARCHAR(255) NOT NULL,

    UNIQUE KEY uk_quote (author_id, quote),
    CONSTRAINT `fk_user_quote1` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_user_quote2` FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS ranking_questions
(
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL,
    type_id  INTEGER      NOT NULL,

    UNIQUE KEY uk_question (question, type_id),
    CONSTRAINT `fk_type_question` FOREIGN KEY (type_id) REFERENCES types (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS ranking_answers
(
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_id INTEGER NOT NULL,
    user_id     INTEGER NOT NULL, -- Submitter
    answer_id   INTEGER NOT NULL, -- Selected pupil

    UNIQUE KEY uk_answer (question_id, user_id),
    CONSTRAINT `fk_question_answer` FOREIGN KEY (question_id) REFERENCES users (id),
    CONSTRAINT `fk_user_answer1` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_user_answer2` FOREIGN KEY (answer_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;


CREATE TABLE IF NOT EXISTS mottos
(
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',

    UNIQUE KEY main (name, description)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS motto_votes
(
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id  INTEGER           NOT NULL,
    motto_id INTEGER           NOT NULL,
    votes    SMALLINT UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE KEY uk_vote (user_id, motto_id),
    CONSTRAINT `fk_voted_user` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_voted_vote` FOREIGN KEY (motto_id) REFERENCES mottos (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS profile_input_types
(
    id   INTEGER PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(20) NOT NULL UNIQUE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS profile_questions
(
    id            INTEGER PRIMARY KEY AUTO_INCREMENT,
    question      VARCHAR(255) NOT NULL UNIQUE,
    question_type INTEGER      NOT NULL,

    CONSTRAINT `fk_profile_question_type` FOREIGN KEY (question_type) REFERENCES profile_input_types (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS profile_answers
(
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_id INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    answer      TEXT    NULL, -- Consider VARCHAR

    UNIQUE KEY uk_answer (question_id, user_id),
    CONSTRAINT `fk_profile_user` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_profile_question` FOREIGN KEY (question_id) REFERENCES profile_questions (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS profile_comments
(
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    profile_id INTEGER NOT NULL, -- User's profile
    user_id    INTEGER NOT NULL, -- User who commented
    comment    TEXT    NOT NULL,

    CONSTRAINT `fk_user_profile` FOREIGN KEY (profile_id) REFERENCES users (id),
    CONSTRAINT `fk_user_commenter` FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS question_questions
(
    id       INTEGER PRIMARY KEY AUTO_INCREMENT,
    question VARCHAR(255) NOT NULL UNIQUE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS question_options
(
    id            INTEGER PRIMARY KEY AUTO_INCREMENT,
    answer_option VARCHAR(50),
    question_id   INTEGER NOT NULL,
    CONSTRAINT `fk_question_question2` FOREIGN KEY (question_id) REFERENCES question_questions (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS question_answers
(
    id          INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_id INTEGER NOT NULL,
    user_id     INTEGER NOT NULL,
    option_id   INTEGER NOT NULL,

    UNIQUE KEY uk_answer (question_id, user_id),
    CONSTRAINT `fk_question_user` FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT `fk_question_question` FOREIGN KEY (question_id) REFERENCES question_questions (id),
    CONSTRAINT `fk_question_answer2` FOREIGN KEY (option_id) REFERENCES question_options (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

CREATE TABLE IF NOT EXISTS profile_char
(
    id         INTEGER PRIMARY KEY AUTO_INCREMENT,
    profile_id INTEGER     NOT NULL, -- profile
    user_id    INTEGER     NOT NULL, -- user who submitted
    txt        VARCHAR(255) NOT NULL,

    UNIQUE KEY uk_answer (profile_id, user_id),
    CONSTRAINT `fk_char_user` FOREIGN KEY (profile_id) REFERENCES users (id),
    CONSTRAINT `fk_char_user2` FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;