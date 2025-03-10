import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { pokemonId, rating } = req.body;

    if (!pokemonId || rating == null) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try {
        const response = await fetch(`http://localhost:3001/${pokemonId}/rate/${rating}`, {
            method: 'POST',
        });

        if (!response.ok) throw new Error('Failed to rate Pokémon');

        res.status(200).json({ message: 'Rating saved successfully' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
}
