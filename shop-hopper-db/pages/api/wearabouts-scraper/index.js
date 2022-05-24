import { main } from '../../../backend/WooCommerceScrapers/wearabouts';
import prisma from '../../../prisma/prisma.js';


export default async (req, res) => {
    try {
        const { business_name, product_type } = req.body;
        const data = await main(business_name, product_type);

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
