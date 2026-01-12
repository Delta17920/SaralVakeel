export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { file } = req.body;
        // Process the file upload here
        res.status(200).json({ message: 'File uploaded successfully' });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
