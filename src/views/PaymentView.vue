<template lang="ko">
	<div class="container">
		<div class="left-side">
			<PageTitle pageTitle="결제하기"></PageTitle>
			<div class="section-container">
				<div class="section-title">예매정보</div>
				<div class="booking-info">
					<img class="poster-img" :src="screening.posterUrl"></img>
					<div class="booking-info-content">
						<div class="movie-name">{{screening.movieTitle}}</div>
						<div><span>{{screening.startDate}}</span><span> {{screening.startTime}}~{{screening.endTime}}</span></div>
						<div>{{screening.theaterName}}/{{screening.hallName}} {{screening.screeningForDisplay}}</div>
						<div>성인 {{seatIds.length}}</div>
					</div>
				</div>
			</div>
			<div class="section-container">
				<div class="section-title">할인적용</div>
				<div class="discount-options">
					<button>할인쿠폰</button>
					<button>VIP 영화쿠폰</button>
					<button>메가박스 관람권</button>
					<button>스토어 교환권</button>
					<button>모바일 관람권</button>
					<button>페이즈 금액권</button>
					<button>중앙패밀리</button>
				</div>
			</div>
			<div class="section-container">
				<div class="section-title">결제수단</div>
				<div class="payment-options">
					<button>신용/체크카드</button>
					<button>간편결제</button>
					<button>휴대폰결제</button>
					<button>내통장결제</button>
				</div>
			</div>
		</div>

		<div class="right-side">
			<div class="payment-info">
				<div class="payment-info-title">결제금액</div>
				<div class="payment-detail-container">
					<div><span>성인 {{seatIds.length}}</span><span class="value">{{screening.totalPrice * seatIds.length}}</span></div>
					<div><span>금액</span><span class="value">{{screening.totalPrice * seatIds.length}}원</span></div>
				</div>
				<div class="payment-detail-container">
					<div><span>할인적용</span><span class="value">0원</span></div>
				</div>
				<div class="final-info">
					<div>
						<span>최종결제금액</span><span class="value"><span class="cost">{{screening.totalPrice * seatIds.length}}</span> 원</span>
					</div>
					<div>
						<span>결제수단</span><span class="value">신용/체크카드</span>
					</div>
				</div>
			</div>
			<div class="navigation-buttons">
				<button class="prev-button">이전</button>
				<button class="payment-button" @click="requestPayment">결제</button>
			</div>
		</div>
	</div>
</template>

<script>
const { IMP } = window;
import PageTitle from "@/components/header/PageTitle.vue";
import { getScreeningAndTotalPrice } from "@/api/screening";
import { preparePayment } from "@/api/payment";
import { confirmBooking } from "@/api/booking";

export default {
  data() {
    return {
      screening: {},
      bookingId: sessionStorage.getItem("bookingId"),
      screeningId: sessionStorage.getItem("screeningId"),
      seatIds: JSON.parse(sessionStorage.getItem("seatIds")),
    };
  },
  components: { PageTitle },
  created() {
    this.fetchScreeningWithTotalPrice();
  },
  mounted() {
    IMP.init("imp26684322");
  },
  methods: {
    async fetchScreeningWithTotalPrice() {
      const response = await getScreeningAndTotalPrice(this.screeningId);
      if (response.code == 200) {
        this.screening = response.data;
      }
    },
    generateUniqueBookingNumber() {
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // yyyyMMdd 형식

      // 랜덤한 문자열 생성 (영문자 + 숫자, 길이 8)
      const randomString = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      return `${formattedDate}-${randomString}`;
    },
    async requestPayment() {
      alert(
        "결제처리가 완료된 후 자정 전(23:00~23:50)에 자동으로 일괄적으로 취소됩니다.\n예외를 대비해 결제 금액은 100원으로 변경됩니다."
      );
      this.screening.totalPrice = 100; //테스트용
      //결제 사전 등록
      const bookingNumber = this.generateUniqueBookingNumber();
      const response = await preparePayment(
        bookingNumber,
        this.screening.totalPrice * this.seatIds.length
      );

      if (response.code == 200) {
        //아임포트 결제 진행
        IMP.request_pay(
          {
            channelKey: "channel-key-9b25fa8e-097c-4a0b-a3e0-56522892ccc9",
            pay_method: "card",
            merchant_uid: bookingNumber, // 에매번호
            amount: this.screening.totalPrice * this.seatIds.length,
            buyer_email: "gildong@gmail.com",
            buyer_name: "홍길동",
            buyer_tel: "010-4242-4242",
            buyer_addr: "서울특별시 강남구 신사동",
            buyer_postcode: "01181",
          },
          async (response) => {
            if (response.error_code != null) {
              return alert(
                `결제에 실패하였습니다. 에러 내용: ${response.error_msg}`
              );
            }
            if (response.success) {
              console.log(response);
              const confirmBookingRequest = {
                bookingId: this.bookingId,
                impId: response.imp_uid,
                amount: response.paid_amount,
                bookingNumber: response.merchant_uid,
                payTime: response.paid_at,
                payMethod: response.pay_method,
                currency: response.currency,
              };
              const bookingResponse = await confirmBooking(
                confirmBookingRequest
              );
              if (bookingResponse.code == 200) {
                this.$router.push({
                  name: "bookingSuccess",
                  params: { bookingId: bookingResponse.data.id },
                });
              } else {
                alert(response.message);
              }
            }
          }
        );
      } else {
        alert(response.message);
      }
    },
  },
};
</script>

<style scoped>
.container {
  font-family: SUIT-Regular;
  display: flex;
  font-size: 15px;
}

/* left side */
.left-side {
  width: 70%;
  margin-right: 20px;
}
.section-container {
  border-top: 1px solid black;
  margin: 50px 0;
}
.section-title {
  font-size: 19px;
  margin: 20px 0;
}

/* 예매정보 */
.booking-info {
  display: flex;
}
.poster-img {
  aspect-ratio: 290/410;
  object-fit: fill;
  width: 100px;
  margin-right: 20px;
  border-radius: 5px;
}
.movie-name {
  font-family: "SUIT-Medium";
  font-size: 17px;
  margin: 20px 0;
}
.booking-info-content :not(:first-child) {
  margin-bottom: 4px;
}

/* 할인정보, 결제수단 */
.discount-options,
.payment-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.discount-options button,
.payment-options button {
  background-color: white;
  font-family: SUIT-Regular;
  border: 1px solid var(--text-sub-color);
  font-size: 15px;
  padding: 13px 0;
  border-radius: 5px;
}

/* right side */
.right-side {
  background-color: #333333;
  width: 30%;
  border-radius: 7px;
  color: white;
  margin-top: 30px;
  position: relative;
  height: 500px;
}
.payment-info {
  margin: 20px;
  box-sizing: border-box;
  height: 85%;
  position: relative;
}
.payment-info-title {
  font-family: "SUIT-Medium";
  font-size: 20px;
  margin-bottom: 20px;
}
.payment-detail-container {
  background-color: #444444;
  margin-bottom: 10px;
  padding: 0 20px;
  font-size: 16px;
  border-radius: 7px;
}
.payment-detail-container div {
  padding: 15px 0;
}
.payment-detail-container div:not(:last-child) {
  border-bottom: 0.5px solid #515458;
}

.final-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  font-family: "SUIT-Medium";
}
.value {
  float: right;
}
.final-info :not(:last-child) {
  margin-bottom: 15px;
}
.final-info .cost {
  color: var(--point-color);
  font-size: 23px;
  font-family: "SUIT-Bold";
  line-height: 10px;
}
/* 이전, 결제 버튼 */
.navigation-buttons {
  position: absolute;
  bottom: 0;
  width: 100%;
}
.navigation-buttons button {
  font-family: "SUIT-Medium";
  font-size: 18px;
  color: white;
  border: none;
  padding: 10px 0;
}
.navigation-buttons .prev-button {
  width: 50%;
  background-color: #53565b;
  border-bottom-left-radius: 7px;
}
.navigation-buttons .payment-button {
  width: 50%;
  background-color: var(--point-color);
  border-bottom-right-radius: 7px;
}
</style>
