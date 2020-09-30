set global innodb_large_prefix = ON;

CREATE TABLE IF NOT EXISTS theme(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    main VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    votes INTEGER DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,

    UNIQUE KEY main (main, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
