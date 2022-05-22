import prisma from '../../../prisma/prisma.js';

export default async (req, res) => {
    try {
        let products = await prisma.product.deleteMany({
            where: {
                business_name: 'Stone Fox Clothing'
            }
        });

        return res.status(200).json({ status: 'success' });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json(error);
    }
};
