// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import shortid from 'shortid';
import db from '../../data/db';

const route = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;

    case 'POST':
      handlePost(req, res);
      break;

    default:
      throw new Error('Unexpected HTTP method');
  }
};

/* -------------------------------- */
/* Route handlers ----------------- */
/* -------------------------------- */
const handleGet = (req, res) => {
  res.status(200).json(getAllReports());
};

const handlePost = (req, res) => {
  // Extract data from request body
  const data = JSON.parse(req.body);

  // Validate data against Report schema
  if (!isValidReport(data)) res.status(400).json({ message: 'Invalid report' });

  // Create new report
  createReport(data);

  // Respond with a success message
  res.status(201).json({ message: 'success' });
};

export default route;

/* -------------------------------- */
/* Helper functions --------------- */
/* -------------------------------- */
function createReport(data) {
  const id = shortid.generate();
  return db
    .get('reports')
    .push({ id, ...data })
    .write();
}

function getAllReports() {
  return db.getState().reports;
}

function isValidReport(reportData) {
  // Todo: implement this
  return true;
}
