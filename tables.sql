set global innodb_large_prefix = ON;

CREATE TABLE IF NOT EXISTS theme(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    main VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,

    UNIQUE KEY main (main, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TODO: Remove dropping
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS class;

CREATE TABLE IF NOT EXISTS teachers(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    middlename VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,

    UNIQUE KEY uk_name (name, middlename, surname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS class(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    teacher_id INTEGER NOT NULL,

    CONSTRAINT `fk_teacher_class` FOREIGN KEY (teacher_id) REFERENCES teachers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    middlename VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    class_id INTEGER NOT NULL,

    UNIQUE KEY uk_name (name, middlename, surname),
    CONSTRAINT `fk_class_user` FOREIGN KEY (class_id) REFERENCES class (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
