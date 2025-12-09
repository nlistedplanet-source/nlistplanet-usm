import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Check if companies already exist
    const existingCount = await Company.countDocuments();
    if (existingCount > 0) {
      console.log(`⏭️  Database already has ${existingCount} companies. Skipping seed.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const companies = [
      {
        name: "National Stock Exchange",
        CompanyName: "National Stock Exchange",
        logo: "https://www.nseindia.com/assets/images/nse-logo.svg",
        sector: "Financial Services",
        Sector: "Financial Services",
        cin: "U67120MH1992PLC065808",
        CIN: "U67120MH1992PLC065808",
        description: "India's leading stock exchange providing a modern market infrastructure",
        website: "https://www.nseindia.com",
        headquarters: "Mumbai, India",
        founded: new Date("1992-11-09"),
        employees: 500,
        valuation: 50000000000, // 50 billion
        shares_outstanding: 1000000,
        price_per_share: 50000
      },
      {
        name: "Swiggy",
        CompanyName: "Swiggy Pvt Ltd",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Swiggy_logo.svg/1200px-Swiggy_logo.svg.png",
        sector: "Food Delivery",
        Sector: "Food Delivery",
        cin: "U52100KA2012PTC065860",
        CIN: "U52100KA2012PTC065860",
        description: "India's leading food delivery and logistics platform",
        website: "https://www.swiggy.com",
        headquarters: "Bangalore, India",
        founded: new Date("2014-08-01"),
        employees: 3500,
        valuation: 12000000000, // 12 billion
        shares_outstanding: 500000,
        price_per_share: 24000
      },
      {
        name: "Zepto",
        CompanyName: "Zepto Pvt Ltd",
        logo: "https://seeklogo.com/images/Z/zepto-logo-80219A091E-seeklogo.com.png",
        sector: "Quick Commerce",
        Sector: "Quick Commerce",
        cin: "U74999KA2021PTC129185",
        CIN: "U74999KA2021PTC129185",
        description: "India's fastest growing instant grocery delivery service",
        website: "https://www.zeptonow.com",
        headquarters: "Bangalore, India",
        founded: new Date("2021-04-01"),
        employees: 2000,
        valuation: 3400000000, // 3.4 billion
        shares_outstanding: 300000,
        price_per_share: 11333
      },
      {
        name: "Oyo Rooms",
        CompanyName: "Oravel Stays Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Oyo_logo.svg",
        sector: "Hospitality",
        Sector: "Hospitality",
        cin: "U55101DL2013PLC260309",
        CIN: "U55101DL2013PLC260309",
        description: "Asia's leading hospitality chain with thousands of properties",
        website: "https://www.oyorooms.com",
        headquarters: "New Delhi, India",
        founded: new Date("2013-08-01"),
        employees: 4000,
        valuation: 10000000000, // 10 billion
        shares_outstanding: 400000,
        price_per_share: 25000
      },
      {
        name: "Ola Cabs",
        CompanyName: "Ola Electric Mobility Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ola_Cabs_logo.svg",
        sector: "Mobility",
        Sector: "Mobility",
        cin: "U74110TG2010PTC066397",
        CIN: "U74110TG2010PTC066397",
        description: "India's largest mobility platform with electric vehicle expansion",
        website: "https://www.olaelectric.com",
        headquarters: "Hyderabad, India",
        founded: new Date("2010-12-01"),
        employees: 3000,
        valuation: 5000000000, // 5 billion
        shares_outstanding: 250000,
        price_per_share: 20000
      },
      {
        name: "Paytm",
        CompanyName: "One97 Communications Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Paytm_logo.svg",
        sector: "FinTech",
        Sector: "FinTech",
        cin: "U72200DL2009PLC189779",
        CIN: "U72200DL2009PLC189779",
        description: "India's leading digital payment and financial services platform",
        website: "https://paytm.com",
        headquarters: "New Delhi, India",
        founded: new Date("2010-05-01"),
        employees: 6000,
        valuation: 16000000000, // 16 billion
        shares_outstanding: 800000,
        price_per_share: 20000
      },
      {
        name: "Zomato",
        CompanyName: "Zomato Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/1/13/Zomato_logo_%282021%29.svg",
        sector: "Food Tech",
        Sector: "Food Tech",
        cin: "U74999MH2010PTC209715",
        CIN: "U74999MH2010PTC209715",
        description: "India's food delivery and restaurant discovery platform",
        website: "https://www.zomato.com",
        headquarters: "Mumbai, India",
        founded: new Date("2008-07-01"),
        employees: 3500,
        valuation: 8000000000, // 8 billion
        shares_outstanding: 400000,
        price_per_share: 20000
      },
      {
        name: "PhonePe",
        CompanyName: "PhonePe Private Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/28/PhonePe_Logo.svg",
        sector: "Digital Payments",
        Sector: "Digital Payments",
        cin: "U65999KA2015PTC081450",
        CIN: "U65999KA2015PTC081450",
        description: "India's leading UPI payments and insurance platform",
        website: "https://www.phonepe.com",
        headquarters: "Bangalore, India",
        founded: new Date("2015-11-01"),
        employees: 2500,
        valuation: 12000000000, // 12 billion
        shares_outstanding: 600000,
        price_per_share: 20000
      },
      {
        name: "Razorpay",
        CompanyName: "Razorpay Software Private Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/82/Razorpay_logo.svg",
        sector: "Payment Gateway",
        Sector: "Payment Gateway",
        cin: "U72200KA2013PTC034547",
        CIN: "U72200KA2013PTC034547",
        description: "India's leading payment gateway for businesses",
        website: "https://razorpay.com",
        headquarters: "Bangalore, India",
        founded: new Date("2014-09-01"),
        employees: 800,
        valuation: 7500000000, // 7.5 billion
        shares_outstanding: 375000,
        price_per_share: 20000
      },
      {
        name: "HDFC Securities",
        CompanyName: "HDFC Securities Limited",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/HDFC_Securities_Logo.svg/512px-HDFC_Securities_Logo.svg.png",
        sector: "Brokerage",
        Sector: "Brokerage",
        cin: "U67120MH1999PLC123652",
        CIN: "U67120MH1999PLC123652",
        description: "India's leading online brokerage and investment platform",
        website: "https://www.hdfcsec.com",
        headquarters: "Mumbai, India",
        founded: new Date("1999-07-01"),
        employees: 2000,
        valuation: 6000000000, // 6 billion
        shares_outstanding: 300000,
        price_per_share: 20000
      },
      {
        name: "CRED",
        CompanyName: "CRED Private Limited",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/CRED_brand_logo.svg",
        sector: "FinTech",
        Sector: "FinTech",
        cin: "U99999KA2018PTC108001",
        CIN: "U99999KA2018PTC108001",
        description: "India's credit card bill payment and rewards platform",
        website: "https://www.cred.club",
        headquarters: "Bangalore, India",
        founded: new Date("2018-08-01"),
        employees: 500,
        valuation: 2200000000, // 2.2 billion
        shares_outstanding: 110000,
        price_per_share: 20000
      },
      {
        name: "Acko Insurance",
        CompanyName: "Acko General Insurance Limited",
        logo: "https://companieslogo.com/img/orig/ACKO.NS-e4187c5c.png",
        sector: "Insurance",
        Sector: "Insurance",
        cin: "U66010KA2017PLC098046",
        CIN: "U66010KA2017PLC098046",
        description: "India's leading digital-first insurance provider",
        website: "https://www.acko.com",
        headquarters: "Bangalore, India",
        founded: new Date("2017-05-01"),
        employees: 800,
        valuation: 1600000000, // 1.6 billion
        shares_outstanding: 80000,
        price_per_share: 20000
      }
    ];

    // Insert companies
    const result = await Company.insertMany(companies);
    console.log(`✅ Successfully seeded ${result.length} companies\n`);

    result.forEach((company) => {
      console.log(`  ✓ ${company.name} (${company.sector})`);
    });

    console.log('\n📊 Summary:');
    console.log(`  Total Companies: ${result.length}`);
    console.log(`  Total Valuation: ₹${companies.reduce((sum, c) => sum + (c.valuation || 0), 0) / 1000000000} billion`);

    await mongoose.connection.close();
    console.log('\n✅ Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding companies:', error);
    process.exit(1);
  }
};

seedCompanies();
