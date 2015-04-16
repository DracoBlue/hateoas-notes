# hateoas-notes Changelog

## dev

* html: fixed owner id for note
* html: added logic to update owner of a note
* html: added internal owner and user authentication for notes
* html: refactored into existingUserId and existingNoteId version
* html: added basic user management
* html: refactored HtmlNotesApi into extra js file
* added extra start.js script
* hal: added tests for `/api/hal/users` and `/api/hal/users/:id`
* hal: added owner of notes
* hal: added hal users
* hal: extra folder for hal api modules
* hal: generate rels for HAL relative to installation
* use `cors` npm module for CORS
* added User, UserAuthentication and Users to domain layer
* added link for HAL and HTML
* initial version