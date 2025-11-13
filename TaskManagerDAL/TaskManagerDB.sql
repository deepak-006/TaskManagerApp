USE Master
GO

CREATE DATABASE TaskManagerDB
GO

USE TaskManagerDB
GO

CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    DateOfBirth DATE NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) DEFAULT 'User' NOT NULL,
    LastLogin DATETIME NULL,
    IsDeleted BIT DEFAULT 0 NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
    UpdatedAt DATETIME DEFAULT GETDATE() NOT NULL
);
GO


CREATE TABLE Tasks (
    TaskId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Status NVARCHAR(50) DEFAULT 'To-Do' NOT NULL, -- To-Do, In-Progress, Done
    Priority NVARCHAR(20) DEFAULT 'Medium' NOT NULL, -- Low, Medium, High
    DueDate DATETIME NULL,
    CreatedBy INT NOT NULL CONSTRAINT FK_Tasks_CreatedBy FOREIGN KEY REFERENCES Users(UserId),
    AssignedTo INT NULL CONSTRAINT FK_Tasks_AssignedTo FOREIGN KEY REFERENCES Users(UserId),
    CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
    UpdatedAt DATETIME DEFAULT GETDATE() NOT NULL,
    IsDeleted BIT DEFAULT 0 NOT NULL,
);
GO

SELECT * FROM Users
GO

SELECT * FROM Tasks
GO

----
--drop table users
----GO

----
--drop table tasks
----GO




