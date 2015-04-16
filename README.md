# hateoas-notes

* Latest Release: [![GitHub version](https://badge.fury.io/gh/DracoBlue%2Fhateoas-notes.png)](https://github.com/DracoBlue/hateoas-notes/releases)
* Build-Status: [![Build Status](https://travis-ci.org/DracoBlue/hateoas-notes.png?branch=master)](https://travis-ci.org/DracoBlue/hateoas-notes)
* Demo-System: <http://hateoas-notes.herokuapp.com>

hateoas-client.js is copyright 2015 by DracoBlue <http://dracoblue.net>

## What is hateoas-notes?

The basic idea of this project is to create a given example application with multiple media types, to evaluate which one
fits best for which use case.

Currently supported media types:

* [HTML](http://www.w3.org/html/) (Hypertext Markup Language)
  * Supported Features: Note, Note Tags, Note List, Note Creation, Note Update, Note Removal, User, User Authentication, User Registration, User Removal, Note Owner
  * Demo-System: <http://hateoas-notes.herokuapp.com/api/html>
* [HAL](http://stateless.co/hal_specification.html) (Hypertext Application Language)
  * Supported Features: Note, Note Tags, Note List, Note Creation, Note Update, Note Removal, User, User Authentication, User Registration, User Removal, Note Owner
  * Demo-System: <http://hateoas-notes.herokuapp.com/api/hal> ([HAL-Browser](haltalk.herokuapp.com/explorer/browser.html#http://hateoas-notes.herokuapp.com/api/hal))

## HateoasNotesApp Domain

The HateoasNotesApp has the following given domain.

### Note

* has a title (a string)
* has a description (a text)
* can be:
    * public (accessible for every `User`)
    * private (accessible only to editors of a `Note`)
* has tags (an array of strings)
* has an owner (a `User`)
* has editors (a list of `User`s)

### Note List

* has `Notes`
* may have a `User Authentication` (which makes private notes visible)

### User

* has a username

### User Authentication

Information to authenticate the `User`.

* has a username
* has a password

### User Registration

A new `User` can be registered with an username and the desired password.

* has a password
* has a username

### User Removal

A user can be removed.

* has a user (`User`)

### Note Creation

Will create a new `Note`.

* has a title
* has a description
* can be public/private
* has tags
* needs `User Authentication` to store the owner

### Note Update

* needs a `Note`
* has a title
* has a description
* can be public/private
* has tags
* needs `User Authentication` to validate the owner or editor

### Note Removal

* needs a `Note`
* needs `User Authentication` to validate the owner or editor

### Editors

A list of `User`s, which are allowed to edit a `Note`.

### Add a Note Editor

* has a note (a `Note`)
* has a editor (an `User`)
* needs `User Authentication` to validate the owner or editor

### Remove a Note Editor

* has a note (a `Note`)
* has a editor (an `User`)
* needs `User Authentication` to validate the owner or editor

## License

The hateoas-notes project is licensed under the MIT License. See LICENSE for more information.