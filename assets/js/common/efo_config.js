/* eslint-disable */
if (typeof EFO === 'undefined') {
  var EFO = {};
}

EFO.common = {};
EFO.page = {};
EFO.common.config = {
  clsForm: '.js-efo',
  showProgress: true,
  showTotalCountOfProgress: true,
  showSuccess: true,
  showError: true,
  showMessage: true,
};
EFO.common.classes = {
  // account / address
  sei: '[name="order_name01"]',
  mei: '[name="order_name02"]',
  deliv_sei: '[name="deliv_name01"]',
  deliv_mei: '[name="deliv_name02"]',
  sei_kana: '[name="order_kana01"]',
  mei_kana: '[name="order_kana02"]',
  deliv_sei_kana: '[name="deliv_kana01"]',
  deliv_mei_kana: '[name="deliv_kana02"]',
  tel: '[name="order_tel"]',
  deliv_tel: '[name="deliv_tel"]',
  zip: '[name="order_zip"]',
  deliv_zip: '[name="deliv_zip"]',
  pref: '[name="order_pref"]',
  deliv_pref: '[name="deliv_pref"]',
  city: '[name="order_addr01"]',
  deliv_city: '[name="deliv_addr01"]',
  address1: '[name="order_addr02"]',
  deliv_address1: '[name="deliv_addr02"]',
  mail_address: '[name="order_email"]',
  mail_address_check: '[name="order_email_check"]',
  login_email: '[name="login_email"]',
  passwd: '[name="password"]',
  passwd_check: '[name="password02"]',
  login_pass: '[name="login_pass"]',
  birth_year: '[name="year"]',
  birth_month: '[name="month"]',
  birth_day: '[name="day"]',
  order_sex: '[name="order_sex"]',
  // credit card
  credit_no: '[name="card_no"]',
  zeus_token_card_number: '[name="zeus_token_card_number"]',
  gmopg_token_card_number: '[name="gmopg_token_card_number"]',
  credit_sec: '[name="security_code"]',
  zeus_token_card_cvv_for_registerd_card: '[name="zeus_token_card_cvv_for_registerd_card"]',
  zeus_token_card_cvv: '[name="zeus_token_card_cvv"]',
  gmopg_token_card_cvv: '[name="gmopg_token_card_cvv"]',
  credit_expired_month: '[name="card_expiration_month"]',
  zeus_token_card_expires_month: '[name="zeus_token_card_expires_month"]',
  gmopg_token_card_expires_month: '[name="gmopg_token_card_expires_month"]',
  credit_expired_year: '[name="card_expiration_year"]',
  zeus_token_card_expires_year: '[name="zeus_token_card_expires_year"]',
  gmopg_token_card_expires_year: '[name="gmopg_token_card_expires_year"]',
  credit_payment_class: '[name="payment_class"]',
  credit_holder_name_mei: '[name="card_holder_name1"]',
  credit_holder_name_sei: '[name="card_holder_name2"]',
  zeus_token_card_name: '[name="zeus_token_card_name"]',
  gmopg_token_card_name: '[name="gmopg_token_card_name"]',
  // other
  terms: '[name="agree"]',
  product_id: '[name="product_id"]',
  payment_id: '[name="payment_id"]',
  cycle_type: '[name="cycle_type"]',
  classcategory_id1: '[name="classcategory_id1"]',
  classcategory_id2: '[name="classcategory_id2"]',
  classcategory_id3: '[name="classcategory_id3"]',
  classcategory_id4: '[name="classcategory_id4"]',
  classcategory_id5: '[name="classcategory_id5"]',
};
EFO.common.validation = {
  // account / address
  sei: {
    // prefix: '※[姓]',
    required: true
  },
  deliv_sei: {
    // prefix: '※[姓]',
    required: true
  },
  mei: {
    // prefix: '※[名]',
    required: true
  },
  deliv_mei: {
    // prefix: '※[名]',
    required: true
  },
  sei_kana: {
    // prefix: '※[セイ]',
    required: true,
    isKana: true
  },
  deliv_sei_kana: {
    // prefix: '※[セイ]',
    required: true,
    isKana: true
  },
  mei_kana: {
    // prefix: '※[メイ]',
    required: true,
    isKana: true
  },
  deliv_mei_kana: {
    // prefix: '※[メイ]',
    required: true,
    isKana: true
  },
  tel: {
    // prefix: '※[電話番号]',
    required: true,
    numeric: true,
    min: 8
  },
  deliv_tel: {
    // prefix: '※[電話番号]',
    required: true,
    numeric: true,
    min: 8
  },
  zip: {
    // prefix: '※[郵便番号]',
    required: true,
    numeric: true,
    length: 7
  },
  deliv_zip: {
    // prefix: '※[郵便番号]',
    required: true,
    numeric: true,
    length: 7
  },
  pref: {
    // prefix: '※[都道府県]',
    selected: true
  },
  deliv_pref: {
    // prefix: '※[都道府県]',
    selected: true
  },
  city: {
    // prefix: '※[市区町村名]',
    required: true
  },
  deliv_city: {
    // prefix: '※[市区町村名]',
    required: true
  },
  address1: {
    // prefix: '※[番地・マンション名]',
    required: true
  },
  deliv_address1: {
    // prefix: '※[番地・マンション名]',
    required: true
  },
  year: {
    // prefix: '※[年]',
    selected: true
  },
  month: {
    // prefix: '※[月]',
    selected: true
  },
  day: {
    // prefix: '※[日]',
    selected: true
  },
  // signIn / signUp
  mail_address: {
    // prefix: '※[メールアドレス]',
    required: true,
    email: true
  },
  mail_address_check: {
    // prefix: '※[メールアドレス(確認)]',
    prefixConfirm: 'メールアドレス欄',
    required: true,
    email: true,
    confirm: '[name="order_email"]'
  },
  login_email: {
    // prefix: '※[メールアドレス]',
    required: true,
    email: true
  },
  passwd: {
    // prefix: '※[パスワード]',
    required: true,
    min: EFO.SITE_CONFIG.password?.min,
    max: EFO.SITE_CONFIG.password?.max,
    alphaNumericSymbol: true
  },
  passwd_check: {
    // prefix: '※[パスワード]',
    prefixConfirm: 'パスワード欄',
    required: true,
    min: EFO.SITE_CONFIG.password?.min,
    max: EFO.SITE_CONFIG.password?.max,
    alphaNumericSymbol: true,
    confirm: '[name="password"]'
  },
  login_pass: {
    // prefix: '※[パスワード]',
    required: true,
    min: EFO.SITE_CONFIG.password?.min,
    max: EFO.SITE_CONFIG.password?.max,
    alphaNumericSymbol: true
  },
  birth_year: {
    selected: EFO.SITE_CONFIG.birthday?.selected
  },
  birth_month: {
    selected: EFO.SITE_CONFIG.birthday?.selected
  },
  birth_day: {
    selected: EFO.SITE_CONFIG.birthday?.selected
  },
  order_sex: {
    selected: EFO.SITE_CONFIG.sex?.selected,
    execObserve: EFO.SITE_CONFIG.sex?.selected
  },
  // credit card
  credit_no: {
    // prefix: '※[カード番号]',
    required: true,
    numeric: true,
    min: 13,
    max: 16
  },
  zeus_token_card_number: {
    // prefix: '※[カード番号]',
    required: true,
    numeric: true,
    min: 13,
    max: 16
  },
  gmopg_token_card_number: {
    // prefix: '※[カード番号]',
    required: true,
    numeric: true,
    min: 13,
    max: 16
  },
  credit_sec: {
    // prefix: '※[セキュリティコード]',
    required: true,
    numeric: true,
    min: 3,
    max: 4
  },
  zeus_token_card_cvv: {
    // prefix: '※[セキュリティコード]',
    required: true,
    numeric: true,
    min: 3,
    max: 4
  },
  zeus_token_card_cvv_for_registerd_card: {
    // prefix: '※[セキュリティコード]',
    required: true,
    numeric: true,
    min: 3,
    max: 4
  },
  gmopg_token_card_cvv: {
    // prefix: '※[セキュリティコード]',
    required: true,
    numeric: true,
    min: 3,
    max: 4
  },
  credit_expired_month: {
    // prefix: '※[有効期限月]',
    selected: true,
    expiration: true,
    elYear: '[name="card_expiration_year"]',
  },
  credit_expired_year: {
    // prefix: '※[有効期限年]',
    selected: true,
    elRowScale: 'td'
  },
  zeus_token_card_expires_month: {
    // prefix: '※[有効期限月]',
    selected: true,
    expiration: true,
    elYear: '[name="zeus_token_card_expires_year"]',
  },
  zeus_token_card_expires_year: {
    // prefix: '※[有効期限年]',
    selected: true,
    elRowScale: 'td'
  },
  gmopg_token_card_expires_month: {
    // prefix: '※[有効期限年]',
    selected: true,
    expiration: true,
    elYear: '[name="gmopg_token_card_expires_year"]',
  },
  gmopg_token_card_expires_year: {
    // prefix: '※[有効期限年]',
    selected: true,
    elRowScale: 'td'
  },
  credit_payment_class: {
    // prefix: '※[お支払い方法]',
    selected: true
  },
  credit_holder_name_mei: {
    // prefix: '※[First Name]',
    required: true
  },
  credit_holder_name_sei: {
    // prefix: '※[Last Name]',
    required: true
  },
  zeus_token_card_name: {
    // prefix: '※[カード名義(ローマ字氏名)]',
    required: true
  },
  gmopg_token_card_name: {
    // prefix: '※[カード名義(ローマ字氏名)]',
    required: true
  },
  // other
  terms:{
    // prefix: '※[利用規約]',
    checked: true
  },
  product_id: {
    // prefix: '※[商品]',
    selected: true
  },
  payment_id: {
    // prefix: '※[お支払方法]',
    selected: true
  },
  cycle_type: {
    // prefix: '※[お届け間隔の指定]',
    selected: true,
    execObserve: true
  },
  classcategory_id1: {
    selected: true
  },
  classcategory_id2: {
    selected: true
  },
  classcategory_id3: {
    selected: true
  },
  classcategory_id4: {
    selected: true
  },
  classcategory_id5: {
    selected: true
  }
};
