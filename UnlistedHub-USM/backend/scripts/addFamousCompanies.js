import mongoose from 'mongoose';
import Company from '../models/Company.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const addFamousCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected\n');

    // Drop old uppercase indexes if they exist
    try {
      await mongoose.connection.db.collection('companies').dropIndex('ISIN_1');
      console.log('🗑️  Dropped ISIN_1 index');
    } catch (e) {
      console.log('ℹ️  ISIN_1 index does not exist');
    }
    
    try {
      await mongoose.connection.db.collection('companies').dropIndex('PAN_1');
      console.log('🗑️  Dropped PAN_1 index');
    } catch (e) {
      console.log('ℹ️  PAN_1 index does not exist');
    }
    
    try {
      await mongoose.connection.db.collection('companies').dropIndex('CIN_1');
      console.log('🗑️  Dropped CIN_1 index\n');
    } catch (e) {
      console.log('ℹ️  CIN_1 index does not exist\n');
    }

    // Delete old companies first
    await Company.deleteMany({});
    console.log('🗑️  Deleted old companies\n');

    const famousCompanies = [
      {
        name: "Swiggy",
        CompanyName: "Bundl Technologies Private Limited",
        scriptName: "Swiggy",
        ScripName: "Swiggy",
        logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Swiggy_logo.svg/200px-Swiggy_logo.svg.png",
        Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Swiggy_logo.svg/200px-Swiggy_logo.svg.png",
        sector: "Food Delivery",
        Sector: "Food Delivery",
        cin: "U74140KA2013PTC108954",
        CIN: "U74140KA2013PTC108954",
        isin: "INE00SW01011",
        ISIN: "INE00SW01011",
        description: "India's leading food delivery platform",
        website: "https://www.swiggy.com",
        headquarters: "Bangalore, India",
        founded: new Date("2014-08-01"),
        employees: 3500,
        valuation: 12000000000,
        shares_outstanding: 500000,
        price_per_share: 24000,
        isActive: true
      },
      {
        name: "Zepto",
        CompanyName: "Kiranakart Technologies Private Limited",
        scriptName: "Zepto",
        ScripName: "Zepto",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Zepto_Logo.png",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Zepto_Logo.png",
        sector: "Quick Commerce",
        Sector: "Quick Commerce",
        cin: "U74999KA2021PTC145670",
        CIN: "U74999KA2021PTC145670",
        isin: "INE00ZE01012",
        ISIN: "INE00ZE01012",
        description: "10-minute grocery delivery service",
        website: "https://www.zeptonow.com",
        headquarters: "Mumbai, India",
        founded: new Date("2021-04-01"),
        employees: 2000,
        valuation: 3600000000,
        shares_outstanding: 300000,
        price_per_share: 12000,
        isActive: true
      },
      {
        name: "OYO Rooms",
        CompanyName: "Oravel Stays Limited",
        scriptName: "OYO",
        ScripName: "OYO",
        logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ola_Cabs_logo.svg",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ola_Cabs_logo.svg",
        sector: "Hospitality",
        Sector: "Hospitality",
        cin: "U55101DL2013PLC260309",
        CIN: "U55101DL2013PLC260309",
        isin: "INE00OY01013",
        ISIN: "INE00OY01013",
        description: "Hospitality chain with budget hotels",
        website: "https://www.oyorooms.com",
        headquarters: "Gurugram, India",
        founded: new Date("2013-05-01"),
        employees: 4000,
        valuation: 9000000000,
        shares_outstanding: 400000,
        price_per_share: 22500,
        isActive: true
      },
      {
        name: "PhonePe",
        CompanyName: "PhonePe Private Limited",
        scriptName: "PhonePe",
        ScripName: "PhonePe",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Phonepe-logo-icon.png",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/0/09/Phonepe-logo-icon.png",
        sector: "Fintech",
        Sector: "Fintech",
        cin: "U72900KA2012PTC066107",
        CIN: "U72900KA2012PTC066107",
        isin: "INE00PP01014",
        ISIN: "INE00PP01014",
        description: "Leading digital payments platform",
        website: "https://www.phonepe.com",
        headquarters: "Bangalore, India",
        founded: new Date("2015-12-01"),
        employees: 2500,
        valuation: 12000000000,
        shares_outstanding: 600000,
        price_per_share: 20000,
        isActive: true
      },
      {
        name: "CRED",
        CompanyName: "Dreamplug Technologies Private Limited",
        scriptName: "CRED",
        ScripName: "CRED",
        logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/CRED_brand_logo.svg",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/CRED_brand_logo.svg",
        sector: "Fintech",
        Sector: "Fintech",
        cin: "U74999KA2018PTC108912",
        CIN: "U74999KA2018PTC108912",
        isin: "INE00CR01015",
        ISIN: "INE00CR01015",
        description: "Credit card bill payment rewards platform",
        website: "https://cred.club",
        headquarters: "Bangalore, India",
        founded: new Date("2018-01-01"),
        employees: 800,
        valuation: 6400000000,
        shares_outstanding: 320000,
        price_per_share: 20000,
        isActive: true
      },
      {
        name: "Dream11",
        CompanyName: "Sporta Technologies Private Limited",
        scriptName: "Dream11",
        ScripName: "Dream11",
        logo: "https://upload.wikimedia.org/wikipedia/en/e/e4/Dream11_Logo.png",
        Logo: "https://upload.wikimedia.org/wikipedia/en/e/e4/Dream11_Logo.png",
        sector: "Gaming",
        Sector: "Gaming",
        cin: "U72900MH2012PTC230073",
        CIN: "U72900MH2012PTC230073",
        isin: "INE00DR01016",
        ISIN: "INE00DR01016",
        description: "Fantasy sports platform",
        website: "https://www.dream11.com",
        headquarters: "Mumbai, India",
        founded: new Date("2008-04-01"),
        employees: 1500,
        valuation: 8000000000,
        shares_outstanding: 400000,
        price_per_share: 20000,
        isActive: true
      },
      {
        name: "Razorpay",
        CompanyName: "Razorpay Software Private Limited",
        scriptName: "Razorpay",
        ScripName: "Razorpay",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
        sector: "Fintech",
        Sector: "Fintech",
        cin: "U72200KA2013PTC082977",
        CIN: "U72200KA2013PTC082977",
        isin: "INE00RA01017",
        ISIN: "INE00RA01017",
        description: "Payment gateway and banking services",
        website: "https://razorpay.com",
        headquarters: "Bangalore, India",
        founded: new Date("2014-01-01"),
        employees: 1200,
        valuation: 7500000000,
        shares_outstanding: 375000,
        price_per_share: 20000,
        isActive: true
      },
      {
        name: "Meesho",
        CompanyName: "Fashnear Technologies Private Limited",
        scriptName: "Meesho",
        ScripName: "Meesho",
        logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/Meesho_Logo.png",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/6/66/Meesho_Logo.png",
        sector: "E-Commerce",
        Sector: "E-Commerce",
        cin: "U72900KA2015PTC082087",
        CIN: "U72900KA2015PTC082087",
        isin: "INE00ME01018",
        ISIN: "INE00ME01018",
        description: "Social commerce platform",
        website: "https://www.meesho.com",
        headquarters: "Bangalore, India",
        founded: new Date("2015-12-01"),
        employees: 2000,
        valuation: 4900000000,
        shares_outstanding: 245000,
        price_per_share: 20000,
        isActive: true
      },
      {
        name: "Boat",
        CompanyName: "Imagine Marketing India Private Limited",
        scriptName: "Boat",
        ScripName: "Boat",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Boat_logo.png",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/Boat_logo.png",
        sector: "Consumer Electronics",
        Sector: "Consumer Electronics",
        cin: "U72900DL2013PTC262114",
        CIN: "U72900DL2013PTC262114",
        isin: "INE00BO01019",
        ISIN: "INE00BO01019",
        description: "Audio electronics brand",
        website: "https://www.boat-lifestyle.com",
        headquarters: "New Delhi, India",
        founded: new Date("2016-01-01"),
        employees: 500,
        valuation: 1500000000,
        shares_outstanding: 150000,
        price_per_share: 10000,
        isActive: true
      },
      {
        name: "Lenskart",
        CompanyName: "Valyoo Technologies Private Limited",
        scriptName: "Lenskart",
        ScripName: "Lenskart",
        logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Lenskart_Logo.png",
        Logo: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Lenskart_Logo.png",
        sector: "Eyewear",
        Sector: "Eyewear",
        cin: "U74999DL2008PTC182097",
        CIN: "U74999DL2008PTC182097",
        isin: "INE00LE01010",
        ISIN: "INE00LE01010",
        description: "Online eyewear retailer",
        website: "https://www.lenskart.com",
        headquarters: "Faridabad, India",
        founded: new Date("2010-01-01"),
        employees: 3000,
        valuation: 4500000000,
        shares_outstanding: 225000,
        price_per_share: 20000,
        isActive: true
      }
    ];

    // Insert companies
    const result = await Company.insertMany(famousCompanies);
    console.log(`✅ Successfully added ${result.length} famous companies\n`);

    result.forEach((company) => {
      console.log(`  ✓ ${company.name} (${company.sector})`);
    });

    console.log('\n📊 Summary:');
    console.log(`  Total Companies: ${result.length}`);
    console.log(`  All companies active: ${result.every(c => c.isActive)}`);

    await mongoose.connection.close();
    console.log('\n✅ Script complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding companies:', error);
    process.exit(1);
  }
};

addFamousCompanies();
