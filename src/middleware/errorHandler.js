// TODO: Complete the error handling middleware
module.exports = (err, req, res, next) => {

  console.error('Error occurred:', err.message);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.message === 'Comic not found') {
    return res.status(404).json({
      error: 'Comic not found',
      message: 'The requested comic does not exist.'
    });
  }
  
  if (err.message === 'Invalid comic ID') {
    return res.status(400).json({
      error: 'Invalid comic ID',
      message: 'Comic ID must be a positive integer.'
    });
  } 

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      timestamp: err.timestamp
    });
  }   
  
  res.status(404).json({
    error: 'Not Found',
    message: 'Error handler not implemented'
  });
};