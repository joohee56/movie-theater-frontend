import { jsonApiInstance } from "@/api/index";
const jsonApi = jsonApiInstance();

async function preparePayment(bookingNumber, amount) {
  try {
    const response = await jsonApi.post("/payments/prepare", {
      bookingNumber: bookingNumber,
      amount: amount,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return error.response.data;
  }
}

export { preparePayment };
