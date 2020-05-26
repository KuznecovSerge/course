Entities = {
  Product: 1,
  Comment: 2,
  Author: 3,
  Blog: 4,
  Journal: 5,
  Course: 6,
  Lesson: 7,
  Webinar: 8,
  Consult: 9,
  Book: 10
};

NotifyType = {
  Add: 1,
  SendMessage: 2,
  Subscribe: 3,
}

FileStorage = {
  path: process.env.NODE_ENV === 'production' ? 'public/assets/media' : '../client/public/assets/media',
  clientPath: '/public/assets/media'
}

module.exports = { Entities, NotifyType, FileStorage };
