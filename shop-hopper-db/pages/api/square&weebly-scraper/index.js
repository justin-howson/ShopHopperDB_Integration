import { main, scrapeAll } from '../../../backend/Square&Weebly';
import prisma from '../../../prisma/prisma.js';


export default async (req, res) => {
    try {
        const { business_name, product_type } = req.body;
        const data = await scrapeAll(business_name, product_type);

        const result = await prisma.product.createMany({
            data: data,
            skipDuplicates: true
        });



        return res.status(200).json({ result });
    } catch (error) {
        console.error('error:', error);
        return res.status(500).json(error);
    }
};
