export type JobsScenario =
  | 'happyPath' // everything works as expected
  | 'noData' // API returns successfully but with no data (e.g. empty array for list endpoints or null for detail endpoints)
  | 'notFound' //job with given id does not exist
  | 'serverError' // server returns with an error (e.g. 500 Internal Server Error)
  | 'loading'; // data is still loading (e.g. due to slow network or large data set)
