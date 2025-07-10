const { countries } = require("country-codes-flags-phone-codes");
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const ct = require("countries-and-timezones");
const moment = require("moment-timezone");
const {
  storeImageOnServer,
  generateImageName,
} = require("./Images");
const { PROJECT_NAME } = require("./configConstants");
const { ImgModuleConfig } = require("./imageConstant");
const axios = require("axios");
const sharp = require("sharp");

const importCountriesListAPI = async (request, fastify) => {
  if (!countries || countries.length === 0) {
    return [];
  }

  const updatedCountries = await Promise.all(
    countries.map(async (country) => {
      try {
        const regionCode = country.code;

        // const itemCode = country.code?.toLowerCase().trim();
        // const alreadyExists = global.tblCountryCodes.find(elem =>
        //   elem?.shortName?.toLowerCase().trim() === itemCode
        // );
        // if (alreadyExists) return null;

        let maxLength = null;
        try {
          const exampleNumber = phoneUtil.getExampleNumber(regionCode);
          if (exampleNumber) {
            maxLength = exampleNumber.getNationalNumber().toString().length;
          }
        } catch {
          maxLength = null;
        }

        let flag = null;
        let flagPath = null;

        if (regionCode && typeof country.flag === "string" && country.flag.trim().length > 0) {
          const flagUrl = `https://flagcdn.com/${regionCode.toLowerCase()}.svg`;
          const response = await axios.get(flagUrl, { responseType: "arraybuffer" });
          const svgBuffer = Buffer.from(response.data, "binary");

          const pngBuffer = await sharp(svgBuffer).png().toBuffer();

          const bodyImage = {
            data: pngBuffer,
            filename: `${country.code}.png`,
            encoding: "7bit",
            mimetype: "image/png",
            limit: false,
          };

          const imgName = generateImageName({ name: `${country.code.trim()}` });

          const projectName = global.tblConfigs.find(
            (item) => item.key?.toLowerCase() === PROJECT_NAME.toLowerCase()
          )?.value;

          const stored = await storeImageOnServer({
            image: bodyImage,
            name: imgName,
            project: projectName,
            ...ImgModuleConfig.Flag,
          });

          flag = stored.fullPath || null;
          flagPath = stored.imagePath || null;
        }

        const tzInfo = ct.getCountry(regionCode);
        const timezoneString = tzInfo?.timezones?.[0] || null;

        let timezone = null;
        let currentDateTime = null;
        let utcOffset = null;

        if (timezoneString && moment.tz.zone(timezoneString)) {
            const now = moment().tz(timezoneString);
            currentDateTime = now.format("YYYY-MM-DD HH:mm:ssZ");
            utcOffset = now.format("Z");
            timezone = timezoneString;
        }

        return {
          countryName: country.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(),
          shortName: country.code,
          countryCode: country.dialCode,
          maxNumber: maxLength,
          isActive: true,
          flag,
          flagPath,
          timezoneFormat: utcOffset,
        };
      } catch (error) {
        console.warn(`Failed processing ${country.code}: ${error.message}`);
        return null;
      }
    })
  );

  return updatedCountries.filter(Boolean);
};

module.exports = {
  importCountriesListAPI,
};
