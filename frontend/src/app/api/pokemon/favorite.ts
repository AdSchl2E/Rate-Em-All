import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { pokemonId } = req.body;
    const userId = 1; // Temporaire : sera remplacé par l'auth plus tard

    if (!pokemonId) {
        return res.status(400).json({ message: 'Missing Pokémon ID' });
    }

    try {
        const response = await fetch(`http://localhost:3001/${userId}/favorite-pokemon/${pokemonId}`, {
            method: 'POST',
        });

        if (!response.ok) throw new Error('Failed to favorite Pokémon');

        res.status(200).json({ message: 'Pokémon added to favorites' });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: 'Server error', error: errorMessage });
    }
}
