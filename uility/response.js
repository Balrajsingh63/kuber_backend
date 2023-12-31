class Response {
    responseData(req, res, responseCase) {
        switch (responseCase) {
            case 'success':
                res.status(200).json({ message: 'Success!', data: [] });
                break;
            case 'error':
                res.status(500).json({ message: 'An error occurred.' });
                break;
            default:
                res.status(404).json({ message: 'Resource not found.' });
        }
    }
}