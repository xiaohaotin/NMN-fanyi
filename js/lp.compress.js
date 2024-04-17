$(window).on('load', function(){
    lp = {

        product_id : $('#product_id').val(),
        quantity : getParam('quantity', '') ? getParam('quantity', '') : $('#quantity').val(),
        ajax_url : $('#ajax_url').val(),
        regular : $('#regular').prop('checked') ? 1 : 0,
        validate_flg : false,
        zeus_credit_flg : false,
        zeus_credit_card_list_template : null,
        zeus_useable_securitycode : false,
        zeus_card_list : null,
        gmopg_credit_flg : false,
        gmopg_credit_card_list_template : null,
        gmopg_useable_securitycode : false,
        gp_paygent_credit_flg : false,
        gp_paygent_credit_card_list_template : null,
        gp_paygent_useable_securitycode : false,
        gp_paygent_card_list : null,
        prev_scroll_pos : 0,
        ups_selected_payment_id : null,
        swith_later_payment_map : {},

        init : function(){
            var ref = this;

            // 最初から商品が選択されていた場合
            if(ref.product_id){
                var errors = [];
                $('.errors').each(function(){
                    errors.push({key_e : $(this).attr('id'), val_e : $(this).val()});
                });
                if (ref.quantity) $('#quantity').val(ref.quantity);
                ref.fetch_data(ref.product_id, ref.quantity, errors);
            }

            // 商品選択時
            $('#product_id').change(function(){
                $('#point_area, .zeus_credit, .gmopg_credit, #amazon_button_area_v2, .gp_paygent_credit').hide();
                $(".classcategory_id_h").remove();
                product_id = $(this).val();
                ref.quantity = $('#quantity').val();
                $('#class_category_select').empty();
                if(product_id){
                    ref.fetch_data(product_id, ref.quantity, null);
                }
                else{ // 「選択してください」を選んだとき。全部クリア
                    $('#deliv_datetime_area, #class_category, #regular_attention_area, #regular_product_area, #regular-deliv_area, #payment_area, #coupon_area, #amazon_onetime_btn, #amazon_recurring_btn').hide();
                    $('#amazon_dummy_btn').show();
                    $('#regular').prop('checked',false);
                    ref.regular = 0;
                }
            });

            // 数量変更時
            $('#quantity').change(function(){
                ref.quantity = $(this).val();
                if(!ref.product_id) return true;

                var errors = [];
                $('.errors').each(function(){
                    errors.push({key_e : $(this).attr('id'), val_e : $(this).val()});
                });
                $('#class_category_select').empty();
                ref.fetch_data(ref.product_id, ref.quantity, errors);
            });

            // 商品一覧がラジオの場合の処理
            $('.product_id').click(function(){
                $('.classcategory_id_h').remove();
                product_id = $(this).val();
                ref.quantity = $('#quantity').val();

                $('#class_category_select').empty();
                if(product_id){
                    ref.fetch_data(product_id, ref.quantity, null);
                }
                else{ // 「選択してください」を選んだとき。全部クリア
                    $('#class_category, #regular_attention_area, #regular_product_area, #regular-deliv_area, #payment_area').hide();
                    $('#regular').prop('checked',false);
                    ref.regular = 0;
                }
            });

            // 規格1選択時
            // appendしたHTML内の要素は.changeや.click では無視されてしまう。
            // 故に$.onを使う必要あり。
            $(document).on('change', '#classcategory_id1', function(){
                // 支払方法欄/クーポン使用欄/ポイント使用欄を一度消す
                $('#point_area, #payment_area, #deliv_datetime_area, #coupon_area').hide();
                ref.changeClassCategory();
                ref.saveClassCategoryToSession($(this).val(), 1);
            });

            // 規格2選択時
            $(document).on('change', '#classcategory_id2', function() {
                // 支払方法欄/クーポン使用欄/ポイント使用欄を一度消す
                $('#point_area, #payment_area, #deliv_datetime_area, #coupon_area').hide();
                ref.saveClassCategoryToSession($(this).val(), 2);
                // 何かしらの値が選択されていたらエリア再表示
                if($(this).val()) {
                    ref.getCouponArea();
                    ref.getPaymentArea();
                    ref.getPointFormData();
                }
            });

            // 定期購入希望のチェックボックス押下時
            $('#regular').click(function(){
                $('.payment_normal, .payment_reg').hide();
                if($(this).prop('checked')){ // チェック入れた場合
                    $('.payment_reg, #regular-deliv_area').show();
                    $('#for_normal_area').hide();
                    ref.getRegularCycle(ref.product_id);
                    $('#unknown_classno_regular').val(0);
                    ref.regular = 1;
                }
                else{
                    $('.payment_normal, #for_normal_area').show();
                    $('#regular-deliv_area').hide();
                    $('#unknown_classno_regular').val(1);
                    ref.regular = 0;
                }
            });

            // アカウントをお持ちの方チェックボックス押下時
            $('#register').click(function(){
                if($(this).prop('checked')){
                    $('#lp-not-login , #lp-deliv , .deliv_other , #deliv_check_area').hide();
                    $('#deliv_check').prop('checked', false);
                    $('#lp-login').show();
                }
                else{
                    $('#lp-not-login , #deliv_check_area').show();
                    $('#lp-login').hide();
                }
            });

            if($('#register').prop('checked')){
                $('#lp-not-login , #lp-deliv , .deliv_other , #deliv_check_area').hide();
                $('#deliv_check').prop('checked', false);
                $('#lp-login').show();
            }
            else{
                $('#lp-not-login , #deliv_check_area').show();
                $('#lp-login').hide();
            }

            // 配送先を指定チェックボックス押下時
            $('#deliv_check').click(function(){
                let opt = $('#payment_id').find('option');
                if($(this).prop('checked')){
                    const selectPayment = new SelectPayment();
                    selectPayment.savePaymentId();
                    let checkRadio = $('input[name=payment_id]:checked').val();
                    $('#lp-deliv , .deliv_other').show();
                    $('.payment_deliv').hide().find('.radio_payment_id').prop('checked', false);
                    ref.hidePaymentDeliv(opt);
                    if ($('option:selected.payment_deliv').length > 0 || checkRadio > 0) {
                        $('#deliv_datetime_area').hide();
                        ref.getPaymentArea(selectPayment);
                    }
                }
                else{
                    $('#lp-deliv , .deliv_other').hide();
                    $('.payment_deliv').show();
                    ref.showPaymentDeliv(opt);
                }
            });

            $('input[name="use_point"]').blur(function() {
                $('#payment_area').hide();
                ref.getPaymentArea();
            });

            $('input[name="point_check"]').change(function() {
                // ポイント使用 ⇒ 使用しないに変更になった場合、使用ポイント数を0にして支払方法再描画
                if ($(this).val() === '2') {
                    $('input[name="use_point"]').val('0');
                }
            });
            // 配送先を別のところに変更したらNP後払いwizを除外
            $('#other_deliv_id').on('change', function(){
                var other_deliv_id = $(this).val();
                let opt = $('#payment_id').find('option');
                if(other_deliv_id){
                    const selectPayment = new SelectPayment();
                    selectPayment.savePaymentId();
                    let checkRadio = $('input[name=payment_id]:checked').val();
                    $('.payment_deliv').hide().find('.radio_payment_id').prop('checked', false);
                    ref.hidePaymentDeliv(opt);
                    if ($('option:selected.payment_deliv').length > 0 || checkRadio > 0) {
                        $('#deliv_datetime_area').hide();
                        ref.getPaymentArea(selectPayment);
                    }
                }
                else{
                    if($('#deliv_check').prop('checked')){

                    }
                    else{
                        $('.payment_deliv').show();
                        ref.showPaymentDeliv(opt);
                    }
                }
            });

            // お支払い方法チェック時
            $(document).on('change', '#payment_id', function(){
                var pid = $(this).val();
                $('.payment_note_area').hide();
                $('#payment_id_' + pid).show();
                // 支払方法がプルダウンで表示されていた場合、支払方法を選択したタイミングで説明を表示
                if ($('.payment_affair').length) {
                    $('.payment_affair').hide();
                    $('#payment_affair_' + pid).show();
                }
                ref.getPaymentForm(pid, null);
            });

            $(document).on('click', '.radio_payment_id', function(){
                ref.getPaymentForm($(this).val(), null);
            });

            $(document).on('change', '#payment_class', function(){
                if($(this).val() == $('#split_payment_class_dmy').val())
                    $('#split_count_th, #split_count_tr').show();
                else
                    $('#split_count_th, #split_count_tr').hide();
            });

            // 定期の配送間隔
            $(document).on('change', '.regular_cycle_select', function(){
                ref.getRegularDelivDate();
            });
            $(document).on('click', '.cycle_type_radio, #quick_flg', function(){
                ref.getRegularDelivDate();
            });
            $(document).on('click', '#first_quick_flg', function(){
                ref.getRegularDelivDate();
                if($(this).prop('checked')){
                    $('#cycle_interval_start_date_area').hide();
                }
                else{
                    $('#cycle_interval_start_date_area').show();
                }
            });

            // GMO関連 JSでカード番号を分割しておく
            $(document).on('keyup', '#gmo_card_no', function(){
                var gmo_card_no = $(this).val();
                if(gmo_card_no.length == 14){
                    $('#gmo_card_no01').val(gmo_card_no.substr(0,4));
                    $('#gmo_card_no02').val(gmo_card_no.substr(4,4));
                    $('#gmo_card_no03').val(gmo_card_no.substr(8,4));
                    $('#gmo_card_no04').val(gmo_card_no.substr(12,2));
                }
                if(gmo_card_no.length == 15){
                    $('#gmo_card_no01').val(gmo_card_no.substr(0,4));
                    $('#gmo_card_no02').val(gmo_card_no.substr(4,4));
                    $('#gmo_card_no03').val(gmo_card_no.substr(8,4));
                    $('#gmo_card_no04').val(gmo_card_no.substr(12,3));
                }
                if(gmo_card_no.length == 16){
                    $('#gmo_card_no01').val(gmo_card_no.substr(0,4));
                    $('#gmo_card_no02').val(gmo_card_no.substr(4,4));
                    $('#gmo_card_no03').val(gmo_card_no.substr(8,4));
                    $('#gmo_card_no04').val(gmo_card_no.substr(12,4));
                }
            });

            // 確認用メアドとパスワードの自動入力
            $('#order_email').keyup(function(){
                $('#order_email_check').val($('#order_email').val());
            });

            $('#password').keyup(function(){
                $('#password02').val($('#password').val());
            });

            // 郵便番号から住所自動入力
            var order_zip_button_enable = $('#order_zip_button').attr('class');
            $('#order_zip').on('input', function(){
                if(!order_zip_button_enable && $(this).val().length == 7){
                    ref.auto_address('order', 'auto');
                }
            });
            $('#deliv_zip').on('input', function(){
                if(!order_zip_button_enable && $(this).val().length == 7){
                    ref.auto_address('deliv', 'auto');
                }
            });
            $('#order_zip_button').click(function(){ref.auto_address('order')});
            $('#deliv_zip_button').click(function(){ref.auto_address('deliv')});

            // フォームのフォーカス時に色付けする
            $('input,textarea').focus(function(){
                $(this).addClass("focus");
            })
            .blur(function(){
                $(this).removeClass("focus");
            });

            // コード式クーポン
            $('#check_coupon_code').click(function(){
                if(!$('#coupon_code').val()) return false;
                var btn = $(this);
                btn.hide().next().show();
                $('#coupon_code_error').empty();
                var params = {
                    action : 'checkCoupon',
                    code : $('#coupon_code').val(),
                    product_id : ref.product_id,
                    quantity : ref.quantity,
                    classcategory_id1 : $('#classcategory_id1').val() || '',
                    classcategory_id2 : $('#classcategory_id2').val() || '',
                    regular : ref.regular
                };
                $.ajax({
                    type : 'post',
                    url : ref.ajax_url,
                    dataType : 'json',
                    data : params,
                    success : function(r){
                        if(!r.success){
                            $('#coupon_code_error').html('<br />' + r.message);
                            btn.show().next().hide();
                            return false;
                        }

                        btn.show().next().hide();
                        $('#entry_coupon_td').hide();
                        $('#view_coupon_td, #coupon_discount_tr').show();
                        $('#code_coupon_code').text(r.use_coupon.code_coupon_code);
                        $('#discount').text(r.use_coupon.format_discount);

                        // 支払い方法表示
                        ref.viewPaymentMethod(r.payment, ref.regular);

                        btn = null;
                    },
                    error:function(a,b,c){error_h(a,b,c)}
                });
            });

            // クーポン解除
            $('#remove_coupon_code').click(function(){
                var btn = $(this);
                btn.hide().next().show();

                var params = {
                    action : 'removeCouponCode',
                    product_id : ref.product_id,
                    quantity : ref.quantity,
                    classcategory_id1 : $('#classcategory_id1').val() || '',
                    classcategory_id2 : $('#classcategory_id2').val() || '',
                    regular : ref.regular
                };

                $.ajax({
                    type : 'post',
                    url : ref.ajax_url,
                    dataType : 'json',
                    data : params,
                    success : function(r){
                        if(!r.success){
                            btn.show().next().hide();
                            return false;
                        }

                        btn.show().next().hide();
                        $('#entry_coupon_td').show();
                        $('#view_coupon_td, #coupon_discount_tr').hide();
                        $('#discount').text(' ');

                        // 支払い方法表示
                        ref.viewPaymentMethod(r.payment, ref.regular);

                        btn = null;
                    },
                    error:function(a,b,c){error_h(a,b,c)}
                });
            });

            // エンター押してsubmitさせない
            $('input').keypress(function(e){
                if(e.keyCode == 13) return false;
            });

            // 入力不備があったらconfirmに遷移させない
            $('#confirm_submit').click(function(e){
                e.preventDefault();
                if (typeof appendUsePaygentTokenTag === "function") {
                    if (location.pathname.indexOf('confirm') < 0) {
                        appendUsePaygentTokenTag('form1');
                    } else {
                        appendUsePaygentTokenTag('ups_dialog_form');
                    }
                }
                var form = (location.pathname.indexOf('confirm') < 0) ? $('#form1').serializeArray() : $('#ups_dialog_form').serializeArray();
                var param = {action : 'validateLp', amazon_pay_flg : 0};
                $(form).each(function(i, v) {
                    if (!v.name.match(/(token_card_expires_month|token_card_expires_year|token_card_name|token_card_number|card_no|card_holder_name)$/)) {
                        param[v.name] = v.value;
                    }
                });
                ref.validateLp(param);
            });

            // 規格がある商品がアップセルに設定されていた場合のLP画面に戻るボタン
            $('.cng_payment_link').click(function(e){
                var class_category_param = '';
                if ($('select[name^=classcategory_id]').length) {
                    $('select[name^=classcategory_id]').each(function(i, elem){
                        class_category_param += '&' + $(elem).attr('name') + '=' + $(elem).val();
                    });
                }
                location.href = $(this).data('href') + '&quantity=' +$('#quantity').val() + class_category_param;
            });

            //
            $(document).on('click', '#use_card_type_1', function(){
                $('#entry_new_card, #confirmation_save_card').show();
                $('#registered_card_list').hide();
            });
            $(document).on('click', '#use_card_type_2', function(){
                $('#entry_new_card, #confirmation_save_card').hide();
                $('#registered_card_list').show();
            });

            // confirm画面用購入確認ボタン
            $('a').click(function() {
                if ($(this).attr('href').indexOf('up=') < 0) {
                    return true;
                }

                // アップセルの画面遷移の場合はダイアログ表示
                if ($('#ups_dialog_form').length == 0 || !$('#ups_dialog_form').hasClass('js-ups_action_dialog')) {
                    return true;
                } else {
                    ref.showUpsDialog();
                }
                return false;
            });

            // アップセルダイアログ
            $('#lpshoppingcolumn.ups_dialog').dialog({
                autoOpen: false,
                resizable: false,
                modal: true,
                width: 780,
                open: function() {
                    $(window).scrollTop(0);

                    $('html').css({
                        'box-sizing':'border-box',
                        'overflow-y':'scroll',
                        'overflow':'hidden'
                    });
                    $(".ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable").draggable( "disable" );
                    $('.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable').css({
                        'top':'10%',
                        'z-index':'9999',
                        'height':'750px',
                        'max-height':'80vh',
                        'opacity': '1',
                    });
                    $('#lpshoppingcolumn.ups_dialog').css({
                        'z-index':'9999',
                        'height':'700px',
                        'max-height':'75vh',
                        'overflow-y':'scroll',
                        'display':'block',
                    });
                },
                close: function() {
                    $('html').css({
                        'overflow-y':'visible',
                        'overflow':'auto'
                    });
                    $(window).scrollTop(window.window_scrollTop);
                }
            });
            $('#smp-lpshoppingcolumn.ups_dialog').dialog({
                autoOpen: false,
                resizable: false,
                modal: true,
                width: window.screen.width * 0.9,
                open: function() {
                    $(window).scrollTop(0);

                    $('html').css({
                        'box-sizing':'border-box',
                        'overflow-y':'scroll',
                        'overflow':'hidden'
                    });
                    $('.ui-dialog.ui-widget.ui-widget-content.ui-corner-all.ui-draggable').css({
                        'top':'10%',
                        'z-index':'9999',
                        'min-height':'40vh',
                        'max-height':'70vh',
                    });
                    $('#smp-lpshoppingcolumn.ups_dialog').css({
                        'z-index':'9999',
                        'min-height':'35vh',
                        'max-height':'65vh',
                        'overflow-y':'scroll',
                        'display':'block',
                    });
                    $('select').blur();
                },
                close: function() {
                    $('html').css({
                        'overflow-y':'visible',
                        'overflow':'auto'
                    });
                    $(window).scrollTop(window.window_scrollTop);
                }
            });

            $('#smp-lpshoppingcolumn.ups_dialog').on('blur', 'select', function() {
                $(window).scrollTop(0);
            });

            // アップセル商品がある場合は商品名を取得
            if ($('#ups_dialog_form').length != 0 && ref.product_id) {
                // アップセル内の商品名を取得＋表示
                var params = {
                    action : 'getProductNames',
                    product_id : ref.product_id,
                }
                $.ajax({
                    type : 'post',
                    url  : ref.ajax_url,
                    dataType: 'json',
                    data : params,
                    async : true, // 非同期通信させる
                    headers: {
                        'pragma': 'no-cache'
                    },
                    timeout : 10000,
                    success : function(r){
                        if(!r){
                        return false;
                        }
                        if(r[ref.product_id]) {
                            $('.product_name').text(r[ref.product_id])
                        }
                    },
                    error : function(XMLHttpRequest, textStatus, errorThrown){
                        error_h(XMLHttpRequest, textStatus, errorThrown);
                    }
                });
            }
        },


        // 画面読込時、商品選択時に呼び出す関数
        fetch_data : function(product_id, quantity, errors){
            var ref = this;
            ref.product_id = product_id;
            $('#confirm_submit, #amazon_button_area').hide();

            // 支払方法/ポイント使用欄/クーポン使用欄は商品と規格が定まるまで非表示
            $('#payment_area, #coupon_area, #deliv_datetime_area').hide();

            var classcategory_ids = [];
            $('.classcategory_id_h').each(function(){
                classcategory_ids.push({key_c : $(this).attr('id'), val_c : $(this).val()});
                $(this).remove();
            });
            $('#class_category').hide();

            var payment_id = $('.payment_id_h').val();

            var quick_flg = $('.quick_flg_h').val();
            $('.quick_flg_h').remove();

            var first_quick_flg = $('.first_quick_flg_h').val();
            $('.first_quick_flg_h').remove();

            var cycles = [];
            $('.cycle_h').each( function() {
                cycles.push({key_c : $(this).attr('id'), val_c : $(this).val()});
                $(this).remove();
            });

            var params = {
                action : 'fetchData',
                product_id : product_id,
                quantity : quantity,
                classcategory_id : classcategory_ids,
                cycles : cycles,
                quick_flg : quick_flg,
                first_quick_flg : first_quick_flg,
                payment_id : payment_id,
                errors : errors
            }

            // #4229 POSTでcacheさせない
            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                if(originalOptions.type.toLowerCase() == 'post'){
                    options.data = jQuery.param($.extend(originalOptions.data||{}, {
                        timeStamp: new Date().getTime()
                    }));
                }
            });

            $.ajax({
                type : 'post',
                url  : ref.ajax_url,
                dataType: 'json',
                data : params,
                async : true, // 非同期通信させる
                //cache: false, // #4229 SMPで度々起こる問題対策←POSTでは意味ないことが判明
                headers: { // #4229
                    'pragma': 'no-cache'
                },
                timeout : 10000,
                success : function(r){
                    if(!r){
                    return false;
                    }

                    // 規格
                    if(r.class_category){
                        $('#class_category').show();
                        $('#class_category_select').append(r.class_category);

                        // 規格がある商品を選択してアップセルから戻ってきた場合の規格制御
                        for(var i in classcategory_ids) {
                            var classcategory_name = classcategory_ids[i]['key_c'].replace('classcategory_id_h', '');
                            $('#' + classcategory_name).val(classcategory_ids[i]['val_c']);
                        }
                    }

                    // amazonpay v2
                    if (r.display_amazon_pay_v2_button) {
                        $('#amazon_button_area_v2').show();
                    }

                    // ダイアログのテンプレートファイルが呼び出されている時はデフォルトでアップセルダイアログを表示させる
                    if ($('.ups_dialog').length != 0) {
                        $('#ups_dialog_form').addClass('js-ups_action_dialog');
                    }

                    // クレジット決済でのアップセルダイアログを許可するか否か
                    var allow_credit = $('#ups_dialog_form').data('allow_credit');

                    // 定期判定
                    if(r.regular){ // 定期商品
                        $('#regular_product_area, #regular-deliv_area, #amazon_recurring_btn').show();
                        $('#for_normal_area, #amazon_dummy_btn, #amazon_onetime_btn').hide();
                        $('#regular').prop('checked','checked');
                        $('#unknown_classno_regular').val(0);
                        $('#regular_cycle_area').html(r.regular_cycle);
                        //ref.getRegularCycle(product_id)
                        ref.getRegularDelivDate();
                        ref.regular = 1;

                        // 旧pagent支払い指定且定期→都度の場合は支払い方法の変更が必須なのでアップセルダイアログの表示をしない(rpstPaymentは除外)
                        if ($('#paygent_credit_type').data('is_paygent_credit_normal') == '1' && !r.is_rpst_payment) {
                            $('#ups_dialog_form').removeClass('js-ups_action_dialog');
                        }

                        // allow_creditが0、もしくは1且つrpstPayment以外、もしくはrpstPaymentでもカード登録できない場合は、都度→定期でのカード決済時アップセルダイアログを表示しない
                        if (allow_credit != '1' || (allow_credit == '1' && !r.is_rpst_payment) ||  !r.is_able_to_register_card) {
                            if ($('#payment_type').data('is_credit') == '1' && $('#product_type').data('is_regular') == '0') {
                                $('#ups_dialog_form').removeClass('js-ups_action_dialog');
                            }
                        }

                        // ゲストウォレット(登録カードを使用せずに、カード入力して保存しない)で、allow_creditが1、且つカード決済の場合のみカード登録アテンションを表示する
                        if (r.is_guest_wallet && allow_credit == '1' && $('#payment_type').data('is_credit') == '1') {
                            $('#regular_attention_area').show();
                        }
                    }
                    else{ // 都度専用
                        $('#regular_attention_area, #regular_product_area, #regular-deliv_area, #amazon_dummy_btn, #amazon_recurring_btn').hide();
                        $('#regular').prop('checked',false);
                        $('#unknown_classno_regular').val(1);
                        $('#for_normal_area, #amazon_onetime_btn').show();
                        ref.regular = 0;

                        // 旧pagent支払い指定且都度→定期の場合は支払い方法の変更が必須なのでアップセルダイアログの表示をしない(rpstPaymentは除外)
                        if ($('#paygent_credit_type').data('is_paygent_credit_regular') == '1' && !r.is_rpst_payment) {
                            $('#ups_dialog_form').removeClass('js-ups_action_dialog');
                        }

                        // allow_creditが0、もしくは1且つrpstPayment以外の場合は、都度→定期（定期→都度）でのrpstPayment以外のカード決済時アップセルダイアログを表示しない
                        if (allow_credit != '1' || (allow_credit == '1' && !r.is_rpst_payment)) {
                            if ($('#payment_type').data('is_credit') == '1' && $('#product_type').data('is_regular') == '1') {
                                $('#ups_dialog_form').removeClass('js-ups_action_dialog');
                            }
                        }
                    }

                    // $('#confirm_submit').show(); show()だとdisplay:inlineになって昔のテンプレートで問題あり
                    $('#confirm_submit, #amazon_button_area').css('display', 'block');

                    var form_name = (location.pathname.indexOf('confirm') < 0) ? 'form1' : 'ups_dialog_form';
                    var sele11 = document[form_name]['classcategory_id1'];

                    if (sele11 && typeof category_id1_stock_list !== 'undefined') {
                        category_id1_count = sele11.options.length;
                        for(i = 0; i < category_id1_count; i++) {
                            if (category_id1_stock_list[i] === '0') {
                                sele11.options[i].disabled = true;
                            }
                        }
                    }

                    // アップセルなどで規格2が引き継がれない件修正
                    if (r.classcategory_id2) {
                        ref.changeClassCategory();
                        $('#classcategory_id2').val(r.classcategory_id2);
                    }
                    // 規格なし商品を選んだときは支払方法欄/クーポン使用欄/ポイント使用欄を即座に表示
                    // また、戻るボタンによる再描画の場合は規格1、規格2がselectedだったら即座に表示
                    if (!r.class_category ||
                        ($('#classcategory_id1').val() && ($('#classcategory_id2').length == 0 || $('#classcategory_id2').val()))
                    ) {
                        ref.getPointFormData();
                        ref.getCouponArea();
                        ref.getPaymentArea(null, errors);
                    }
                    else {
                        // #7461 確認画面から戻った際に支払いフォームが出てこないことがある件の対策
                        // 原因はgetPaymentAreaが非同期なので、getPaymentFormが先に処理されることがあるため。promise使いたいけどIEで動かなくなる・・・
                        // #4249 アップセルで戻ってきた際に支払い方法の引き継ぎを一旦解除
                        var get_params = getQueryString();
                        if(payment_id && !get_params.up) ref.getPaymentForm(payment_id, errors);
                    }
                },
                error : function(XMLHttpRequest, textStatus, errorThrown){
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
            // $('#confirm_submit').css('display', 'block'); ここだと通信エラー発生時もボタンが表示される
        },


        // 郵便番号から住所を自動入力する
        auto_address : function(type, auto){
            var ref = this;
            var zip = $('#' + type + '_zip').val();
            if(zip.length == 7 || zip.length == 8){
                $.ajax({
                    type : 'post',
                    url : ref.ajax_url,
                    dataType : 'json',
                    data : {action : 'getAddress', zip : zip, kind : type},
                    success : function(b){
                        $('#' + type + '_pref').val(b.order_pref);
                        $('#' + type + '_addr01').val(b.order_addr01);
                        if(b.order_pref){
                            $('#' + type + '_pref').css("background", "rgb(255,255,255)");
                            $('#' + type + '_addr01').css("background", "rgb(255,255,255)");
                            if (auto != 'auto') {
                                $('#' + type + '_addr02').focus();
                            }
                        }
                        const changeEvent = new Event('change');
                        document.querySelector('#' + type + '_pref').dispatchEvent(changeEvent);
                        document.querySelector('#' + type + '_addr01').dispatchEvent(changeEvent);
                    },
                    error:function(a,b,c){error_h(a,b,c)}
                });
            }
        },

        // 支払い方法表示
        viewPaymentMethod : function(payment, regular, payment_id){

            payment_id = payment_id == null ? 0 : payment_id;

            // #4148 支払い方法を再度取
            $('#payment_detail_area, #payment_methods').empty();
            $('#payment_area').show();
            $('#payment_methods').append(payment);

            // #4453 支払方法選択時特記事項が二つ表示される件修正
            $('.payment_normal, .payment_reg').hide();
            if (regular == 1) {
                $('.payment_reg').show();
            } else {
                $('.payment_normal').show();
            }
            // 「別のお届け先を指定」プルダウン or「上記と別の住所へお届けする」チェックがついていたら請求書同梱系の支払方法は表示しない
            if ($('#deliv_check').prop('checked')|| ($('#other_deliv_id').length > 0 && $('#other_deliv_id').val() != '')) {
                let opt = $('#payment_id').find('option');
                lp.hidePaymentDeliv(opt);
                $('.payment_deliv').find('.radio_payment_id').prop('checked', false);
            }
            $('.payment_note_area').hide();

            // アップセル用
            if (location.pathname.indexOf('confirm') >= 0) {
                // アップセル内の支払方法デフォ値設定（選択済みの支払方法が選択可能名場合はデフォルトで指定しておく）
                if (lp.ups_selected_payment_id == null) lp.ups_selected_payment_id = payment_id;
                if (lp.ups_selected_payment_id != 0 && $('.ups_dialog').length != 0) {
                    if ($('select#payment_id option[value=' + lp.ups_selected_payment_id + ']').length == 0 && $('.ups_dialog').is(':hidden')) {
                        // 同一の支払い方法がない場合はアップセルのボタンを押した時にLP画面に遷移させる
                        $('#ups_dialog_form').removeClass('js-ups_action_dialog');
                    } else {
                        if ($('select#payment_id option[value=' + lp.ups_selected_payment_id + ']').length) {
                            // アップセル商品で選択済みの支払方法が利用可能な場合
                            $('select#payment_id option[value=' + lp.ups_selected_payment_id + ']').prop('selected', true);

                            // アップセルプルダウンの場合は支払方法をプルダウンではなくテキストで表示する
                            $('#payment_id_hidden').val(lp.ups_selected_payment_id);
                            if (regular == 1) $('#regular-deliv_area').show();
                            payment_txt = $('select#payment_id option').filter(':selected').text();
                            $('.lp_submit_area').show();
                            $('#confirm_submit').show();
                            $('.lp_step_img').show();
                            $('#confirm_submit_image').show();
                            $('.cng_payment_link').css('background-color', '#f6f6f6');
                        } else {
                            // アップセルダイアログ内で選択した規格で選択済みの支払方法が利用できない場合
                            payment_txt = '選択されたお支払い方法がご利用できない商品です';
                            $('input[name=payment_id]').val('');
                            $('#regular-deliv_area').hide();
                            $('.lp_submit_area').hide();
                            $('#confirm_submit').hide();
                            $('.lp_step_img').hide();
                            $('#confirm_submit_image').hide();
                            $('.cng_payment_link').css('background-color', 'rgb(255, 160, 160)');
                        }
                        $('#payment_txt').text(payment_txt);
                        $('#payment_methods').text('');
                        lp.getPaymentForm(lp.ups_selected_payment_id, null);
                    }
                }

                // アップセル商品の選択で通常、定期が切り替わる場合の対応
                if (regular == 1) {
                    if (!$('input[name="regular"]').length) {
                        $('<input>').attr({
                            type: 'hidden', id: 'regular', name: 'regular', value: '1'
                        }).appendTo('#lp_post_hidden');
                    };
                    $('input[name="no_regular"]').val(0);
                } else {
                    if ($('input[name="regular"]').length) {
                        $('input[name="regular"]').remove();
                    };
                    $('input[name="no_regular"]').val(1);
                }
            }

            if ($('.payment_affair').length) {
                $('.payment_affair').hide();
                // 選択済の支払方法の説明を表示
                var pid = $('#payment_id option:selected').val();
                $('#payment_affair_' + pid).show();
            }
        },

        // 決済情報の入力フォーム
        getPaymentForm : function(payment_id, errors){
            var ref = this;
            var product_id = ref.product_id || $('#product_id').val();
            var p_info = [];
            var other_deliv_id = $('#other_deliv_id').val() || '';
            $('.payment_info_class').each( function() {
                p_info.push({key_p : $(this).attr('id'), val_p : $(this).val()});
            });
            $('.payment_info_class').remove();

            $('.zeus_credit, .gmopg_credit, .gp_paygent_credit').hide(); // クレジット用入力フォーム一旦非表示
            ref.zeus_credit_flg = false;
            ref.gmopg_credit_flg = false;
            ref.gp_paygent_credit_flg = false;

            // お届け指定日時関連
            var deliv_date = $('.deliv_date_h').val();
            $('.deliv_date_h').remove();
            var deliv_time_id = $('.deliv_time_id_h').val();
            $('.deliv_time_id_h').remove();
            if($('#regular').attr('type') === 'hidden'){
                if($('#regular').val() == 1)
                    ref.regular = 1;
                else
                    ref.regular = 0;
            }
            else{
                if($('#regular').prop('checked'))
                    ref.regular = 1;
                else
                    ref.regular = 0;
            }

            if (ref.regular == 1) {
                $('.gp_paygent_select_payment_class').hide();

                if ($('[name=gp_paygent_card_add_space_available]').val() == 0) {
                    $('#gp_paygent_token_action_type_quick').prop('checked', true);
                    $('#gp_paygent_token_action_type_new, [for=gp_paygent_token_action_type_new]').hide();
                }
            } else {
                $('.gp_paygent_select_payment_class').show();
                $('#gp_paygent_token_action_type_new, [for=gp_paygent_token_action_type_new]').show();

                if ($('[name=gp_paygent_card_add_space_available]').val() == 0) {
                    $('#register_gp_paygent_credit_2').prop('checked', true);
                    $('#register_gp_paygent_credit_1, [for=register_gp_paygent_credit_1]').hide();
                }
            }

            var params = {
                action : 'getPaymentForm',
                payment_id : payment_id,
                product_id : product_id,
                p_info : p_info,
                regular : ref.regular,
                other_deliv_id : other_deliv_id,
                deliv_date : deliv_date,
                deliv_time_id : deliv_time_id,
                errors : errors
            };

            $.ajax({
                type : 'post',
                url  : ref.ajax_url,
                dataType: 'json',
                data : params,
                timeout : 10000,
                async : false,
                success : function(r){
                    $('.payment_detail_area').empty();
                    $('.payment_tr').hide();
                    if(r.payment_form){
                        $('#payment_tr_' + payment_id).show();
                        $('#payment_detail_area_' + payment_id).append(r.payment_form);
                        if (ref.regular === 1) {
                            $('#card_save_flg_2').remove();
                        }
                    }
                    if(r.deliv_date_time){
                        if (!(location.pathname.indexOf('confirm') >= 0 && $('input[name=payment_id]').val() == '')) {
                            $('#deliv_datetime_area').show();
                            $('#deliv_time_area').html(r.deliv_date_time);
                        }
                    }

                    if (location.pathname.indexOf('confirm') < 0) {
                        // 7288 Zeus対応
                        ref.getZeuscredit(r);

                        // #9607 GMO-PG対応
                        ref.getGmopg(r);

                        // #18585 新Paygent対応
                        ref.getGpPaygentCredit(r);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },


        // 定期配送間隔指定
        getRegularCycle : function(product_id){
            var ref = this;
            var quick_flg = $('.quick_flg_h').val();
            $('.quick_flg_h').remove();

            var first_quick_flg = $('.first_quick_flg_h').val();
            $('.first_quick_flg_h').remove();

            var cycles = [];
            $('.cycle_h').each( function() {
                cycles.push({key_c : $(this).attr('id'), val_c : $(this).val()});
                $(this).remove();
            });

            $.ajax({
                type : 'post',
                url  : ref.ajax_url,
                dataType: 'json',
                data : {action : 'getRegularCycle', product_id : product_id, cycles : cycles, quick_flg : quick_flg, first_quick_flg : first_quick_flg},
                async : false,
                timeout : 10000,
                success : function(r){
                    $('#regular_cycle_area').html(r);
                    ref.getRegularDelivDate();
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },

        // 規格1 選択時の処理
        changeClassCategory : function(){
            var ref = this;
            var form_name = (location.pathname.indexOf('confirm') < 0) ? 'form1' : 'ups_dialog_form';
            var sele11 = document[form_name]['classcategory_id1'];
            var sele12 = document[form_name]['classcategory_id2'];
            if(sele11 && sele12) {
                index = sele11.selectedIndex;
                $('#classcategory_id2').empty();

                len = lists[index].length;
                for(i = 0; i < len; i++) {
                    sele12.options[i] = new Option(lists[index][i], vals[index][i]);
                    if (stock_lists[index][i] === '0') {
                        sele12.options[i].disabled = true;
                    }
                }
            } else if (sele11) {
                if (sele11.value) {
                    // 規格2がない場合はここで規格が確定するので支払方法欄/クーポン欄/ポイント使用欄を表示
                    ref.getCouponArea();
                    ref.getPaymentArea();
                    ref.getPointFormData();
                }
            }
        },

        // 定期お届け日表示
        getRegularDelivDate : function(){
            var ref = this;
            var cycle_type = $('.cycle_type_radio:checked').val();

            $('.cycle_form').hide();
            if(cycle_type){

                if(cycle_type == 1){
                    $('#cycle_type1_form').show();
                    var select_val = {cycle_date_monthly : $('#cycle_date_monthly').val(), cycle_date_day : $('#cycle_date_day').val()};
                }
                if(cycle_type == 2){
                    $('#cycle_type2_form').show();
                    var select_val = {cycle_week_monthly : $('#cycle_week_monthly').val(), cycle_week_ordinal : $('#cycle_week_ordinal').val(), cycle_week_week : $('#cycle_week_week').val()};
                }
                if(cycle_type == 3){
                    $('#cycle_type3_form').show();
                    var select_val = {cycle_interval_start_date : $('#cycle_interval_start_date').val(), cycle_interval_interval : $('#cycle_interval_interval').val()};
                }

                var params = {
                    action : 'getRegularDelivDate',
                    product_id : ref.product_id,
                    cycle_type : cycle_type,
                    select_val : select_val,
                    quick_flg : $('#quick_flg:checked').val(),
                    first_quick_flg : $('#first_quick_flg:checked').val()
                };

                $.ajax({
                    type : 'post',
                    url  : ref.ajax_url,
                    dataType: 'json',
                    data : params,
                    async : false,
                    timeout : 10000,
                    success : function(r){
                        if(!r) return true;
                        $('.regular_deliv_day').empty();
                        $('#regular_deliv_day_first').append(r.first);
                        $('#regular_deliv_day_second').append(r.second);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        error_h(XMLHttpRequest, textStatus, errorThrown);
                    }
                });
            }
        },

        // validate
        validateLp : function(param){
            //paygent トークン取得

            param.card_no1 = '';
            param.card_no2 = '';
            param.card_no3 = '';
            param.card_no4 = '';
            param.card_expiration_year = '';
            param.card_expiration_month = '';
            param.card_holder_name1 = '';
            param.card_holder_name2 = '';

            param.card_no = '';
            param.card_no01 = '';
            param.card_no02 = '';
            param.card_no03 = '';
            param.card_no04 = '';
            param.card_month = '';
            param.card_year = '';
            param.card_name01 = '';
            param.card_name02 = '';

            if (param.use_paygent_credit == 1 && param.use_paygent_token == 1 && location.pathname.indexOf('confirm') >= 0) {
                param.use_card_type = $('input[name="use_card_type"]').val();
            }

            var ref = this;

            $.ajax({
                type : 'post',
                url : ref.ajax_url,
                dataType : 'json',
                data : param,
                async : false,
                success : function(r){
                    if(!r){
                        // #7286 zeus対応
                        if (ref.zeus_credit_flg === true) {
                            // アップセルの場合はカード情報を入力させないのでバリデーションはスルー
                            if (location.pathname.indexOf('confirm') < 0) {
                                if ($('#zeus_token_action_type_new').prop('checked')) {
                                    if ( $('#zeus_token_card_number').val() === ''
                                    || $('#zeus_token_card_expires_month').val() === ''
                                    || $('#zeus_token_card_expires_year').val() === ''
                                    || $('#zeus_token_card_name').val() === ''
                                    ) {
                                        alert('カード情報に不備があります');
                                        return false;
                                    }

                                    if (ref.zeus_useable_securitycode && $('#zeus_token_card_cvv').val() === '') {
                                        alert('セキュリティコードを入力してください');
                                        return false;
                                    }

                                    // ハイフン消す
                                    var card_number = $('#zeus_token_card_number').val();
                                    $('#zeus_token_card_number').val(card_number.replace(/-/g, ''));
                                    // #23556 下四桁だけ取得しておく
                                    ref.setSliceCardNumber(card_number);
                                } else {
                                    if (!$('.payment_wallet_id:checked').val()) {
                                        alert('使用する登録カードを選択してください');
                                        return false;
                                    }

                                    if (ref.zeus_useable_securitycode && $('#zeus_token_card_cvv_for_registerd_card').val() === '') {
                                        alert('セキュリティコードを入力してください');
                                        return false;
                                    }
                                }
                                zeusCreditBeforeSubmit();
                            } else {
                                document.ups_dialog_form.submit();
                            }
                            return true;
                        }

                        if (ref.gp_paygent_credit_flg === true) {
                            // アップセルの場合はカード情報を入力させないのでバリデーションはスルー
                            if (location.pathname.indexOf('confirm') < 0) {
                                if ($('#gp_paygent_token_action_type_new').prop('checked')) {
                                    if ( $('#gp_paygent_token_card_number').val() === ''
                                      || $('#gp_paygent_token_card_expires_month').val() === ''
                                      || $('#gp_paygent_token_card_expires_year').val() === ''
                                      || $('#gp_paygent_token_card_name').val() === ''
                                    ) {
                                        alert('カード情報に不備があります');
                                        return false;
                                    }

                                    if (ref.gp_paygent_useable_securitycode && $('#gp_paygent_token_card_cvv').val() === '') {
                                        alert('セキュリティコードを入力してください');
                                        return false;
                                    }
                                    // ハイフン消す
                                    var card_number = $('#gp_paygent_token_card_number').val();
                                    $('#gp_paygent_token_card_number').val(card_number.replace(/-/g, ''));
                                    ref.setSliceCardNumber(card_number);
                                } else {
                                    if (!$('.payment_wallet_id:checked').val()) {
                                        alert('使用する登録カードを選択してください');
                                        return false;
                                    }

                                    if (ref.gp_paygent_useable_securitycode && $('#gp_paygent_token_card_cvv_for_registerd_card').val() === '') {
                                        alert('セキュリティコードを入力してください');
                                        return false;
                                    }
                                }
                                paygent_token_send('form1');
                            } else {
                                document.ups_dialog_form.submit();
                            }
                            return true;
                        }

                        if (ref.gmopg_credit_flg === true) {
                            // アップセルの場合はカード情報を入力させないのでバリデーションはスルー
                            if (location.pathname.indexOf('confirm') < 0) {
                                if ($('#gmopg_token_action_type_new').prop('checked')) {
                                    if ( $('#gmopg_token_card_number').val() === ''
                                    || $('#gmopg_token_card_expires_month').val() === ''
                                    || $('#gmopg_token_card_expires_year').val() === ''
                                    || $('#gmopg_token_card_name').val() === ''
                                    ) {
                                        alert('カード情報に不備があります');
                                        return false;
                                    }

                                    // ハイフン消す
                                    var card_number = $('#gmopg_token_card_number').val();
                                    $('#gmopg_token_card_number').val(card_number.replace(/-/g, ''));
                                    ref.setSliceCardNumber(card_number);
                                } else {
                                    if (!$('.gmopg_payment_wallet_id:checked').val()) {
                                        alert('使用する登録カードを選択してください');
                                        return false;
                                    }
                                }

                                if (ref.gmopg_useable_securitycode && $('#gmopg_token_card_cvv').val() === '') {
                                    alert('セキュリティコードを入力してください');
                                    return false;
                                }

                                fnCheckGmopgTokenSubmit(param.mode, 'scroll', '.smp-lp-confirm');
                            } else {
                                fnModeSubmit(param.mode, 'scroll', '.smp-lp-confirm');
                            }
                            return true;
                        }

                        ref.validate_flg = true;
                        if (!param.amazon_pay_flg) {
                            if (param.use_gmopg == 1 && param.use_gmo_token == 1) {
                                if (location.pathname.indexOf('confirm') < 0) {
                                    var is_regular = (param.no_regular == 1) ? 0 : 1;
                                    ref.setSliceCardNumber($("[name=card_no04]").val());
                                    fnCheckGmoTokenSubmit(param.mode,'scroll', '.smp-lp-confirm', is_regular);
                                } else {
                                    fnSetFormSubmit('ups_dialog_form', 'scroll', '.smp-lp-confirm');
                                }
                            } else if (param.use_paygent_credit == 1 && param.use_paygent_token == 1 && location.pathname.indexOf('confirm') < 0) {
                                if ($('[name=card_no]').val() != undefined) {
                                    ref.setSliceCardNumber($('[name=card_no]').val());
                                }
                                paygent_token_send('form1');
                            } else if (location.pathname.indexOf('confirm') >= 0) {
                                fnSetFormSubmit('ups_dialog_form', 'scroll', '.smp-lp-confirm');
                            } else {
                                deleteCardInformation();
                                fnSetFormSubmit('form1', 'scroll', '.smp-lp-confirm');
                            }
                        }

                        return true;
                    }

                    // アップセルダイアログでポイント超過のバリデーションエラー時は支払い方法変更ボタンの色を変更する
                    if (r.error.hasOwnProperty('use_point') && $('.cng_payment_link').length != 0) {
                        $('.cng_payment_link').css('background-color', 'rgb(255, 160, 160)');
                    }

                    $('#alert_errors').error('<br />');
                    var html = '';
                    for (var i in r.error){
                        $('*[name=' + i + ']').css("background", "rgb(255,160,160)");
                        html += r.error[i];
                    }
                    $('#alert_errors').html(html).show('slow');
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                }
            });
        },

        // クーポン欄表示
        getCouponArea : function() {
            var ref = this;
            var param = {
                action       : 'getCouponArea',
                product_id   : ref.product_id,
                quantity     : ref.quantity,
                classcategory_id1 : $('#classcategory_id1').val() || '',
                classcategory_id2 : $('#classcategory_id2').val() || '',
                regular : ref.regular
            };
            $.ajax({
                type     : 'post',
                url      : ref.ajax_url,
                dataType : 'json',
                data     : param,
                async    : true,
                success  : function(r) {
                    // クーポン欄表示
                    if (r.isApplied) {
                        // クーポンコード確定時は適用しているコードと値引金額を表示
                        if(!r.success){
                            // $('#coupon_code_error').html('<br />' + r.message);
                            // btn.show().next().hide();

                            return false;
                        }
                        // TODO: 関数化したい(showCouponDiscount)
                        // btn.show().next().hide();
                        $('#entry_coupon_td').hide();
                        $('#view_coupon_td, #coupon_discount_tr').show();
                        $('#code_coupon_code').text(r.use_coupon.code_coupon_code);
                        $('#discount').text(r.use_coupon.format_discount);
                    } else {
                        // クーポンコード未確定時はクーポンコード入力欄を表示
                        $('#entry_coupon_td').show();
                        $('#view_coupon_td').hide();
                    }
                    $('#coupon_area').show();
                },
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },
        // 支払方法欄表示
        getPaymentArea : function(selectPayment, errors) {
            var ref = this;
            payment_id = $('.payment_id_h').val();
            $('.payment_id_h').remove();

            var param = {
                action: 'getPaymentArea',
                product_id: ref.product_id,
                quantity: ref.quantity,
                payment_id: payment_id,
                classcategory_id1: $('#classcategory_id1').val() || '',
                classcategory_id2: $('#classcategory_id2').val() || '',
                use_point: $('input[name="use_point"]').val(),
                point_check: $('input[name="point_check"]').val()
            };
            $.ajax({
                type: 'post',
                url : ref.ajax_url,
                dataType : 'json',
                data : param,
                async: true,
                success : function(r) {
                    // 支払い方法表示
                    ref.viewPaymentMethod(r.payment, ref.regular, payment_id);

                    var select_payment_id = selectPayment instanceof SelectPayment && selectPayment.payment_id;
                    var swith_later_payment_map_to = r.swith_later_payment_map && r.swith_later_payment_map[select_payment_id];
                    if (swith_later_payment_map_to != null) {
                        $('#payment_id').val(swith_later_payment_map_to);
                        $('input[value=' + swith_later_payment_map_to + '].radio_payment_id').prop('checked', true);
                    }

                    // #7461  確認画面から戻った際に支払いフォームが出てこないことがある件の対策
                    if (payment_id) ref.getPaymentForm($('#payment_id').val(), errors);
                },
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },
        // ポイント使用欄表示
        getPointFormData : function(param) {
            var ref = this;

            // 選択されている商品が定期の場合は表示しない
            if ($('#point_area').length !== 0) {
                if (!ref.regular) {
                    $('#point_area').show();
                    fnCheckInputPoint();
                    if ($('.point_check_h').length === 1) {
                        // ポイントを使用する
                        $('.point_check_h').remove();
                        // 使用ポイント数を表示する
                        $("[name='use_point']").val($('.use_point_h').val()||0);
                        $('.use_point_h').remove();
                    }
                } else {
                    $('#point_area').hide();
                }
            }
            var param = {
                action: 'getPointFormData',
                product_id: ref.product_id,
                quantity: ref.quantity,
                classcategory_id1: $('#classcategory_id1').val() || '',
                classcategory_id2: $('#classcategory_id2').val() || ''
            };
            $.ajax({
                type: 'post',
                url : ref.ajax_url,
                dataType : 'json',
                data : param,
                async: true,
                success : function(r) {
                    $('#price').html(r.price + '円');
                },
                error : function(XMLHttpRequest, textStatus, errorThrown) {
                    error_h(XMLHttpRequest, textStatus, errorThrown);
                }
            });
        },
        adjustScroll : function(id_target, relative_top, animate) {
            if (typeof animate === 'undefined') animate = true;
            var abs = function(n) {
                return n > 0 ? n : -n;
            }
            var calcTop = function(obj) {
                return obj.offsetParent !== null ? calcTop(obj.offsetParent) + obj.offsetTop : obj.offsetTop;
            }
            // 推奨ブラウザ + safari では、 PC/smp 両方で正しい値が返る。
            var zoomRatio = function() {
                var zoom = $('html').css('zoom');
                var calcZoom = window.innerWidth / document.body.clientWidth;

                if (zoom == null || zoom === "1") {
                    return 1;
                }

                // Chrome smp対策
                if (abs(calcZoom - parseFloat(zoom)) < 0.1) {
                    return parseFloat(zoom);
                }

                return 1;
            }
            var position = (calcTop($(id_target).get(0)) + relative_top) * zoomRatio();
            var pos_diff = abs(position - this.prev_scroll_pos);

            if ( animate ) {
            $('html, body').animate({scrollTop: position}, 400, 'swing');
            } else {
            $('html, body').scrollTop(position);
            }

            // 僅差になるまで繰り返す。
            if ( (pos_diff / position) > 0.005 ) {
            this.prev_scroll_pos = position;
            setTimeout(this.adjustScroll.bind(this), 500, id_target, relative_top, animate);
            }
        },

        getZeuscredit :  function (card_info) {
            if (!card_info.zeus_credit_flg) {
                return;
            }

            var ref = this;

            // カード情報保持
            ref.zeus_card_list = card_info.card_list;

            // カード情報入力フォーム表示
            $('#zeus_token_card_info').show();

            $('[for="zeus_token_action_type_new"]').html('新規カード');
            $('[for="zeus_token_action_type_quick"]').html('登録済カード');

            // カードリスト表示用テンプレートを保持しておく
            var first = false;
            if (ref.zeus_credit_card_list_template === null) {
                ref.zeus_credit_card_list_template = $('#zeus_card_list_body').html();
                first = true;
            }

            // 登録カード表示
            if (card_info.card_list !== undefined && Object.keys(card_info.card_list).length > 0) {
                $('#zeus_card_list_body').empty();
                for (var key in card_info.card_list) {
                    var html = ref.zeus_credit_card_list_template;
                    html = html.replace('{{card_number}}', card_info.card_list[key].card_number);
                    html = html.replace('{{card_expire}}', card_info.card_list[key].card_expire);
                    html = html.replace(/{{card_id}}/g, card_info.card_list[key].card_id);
                    $('#zeus_card_list_body').append(html);
                }
                $('#zeus_token_action_type_quick').show();
                $('label[for=zeus_token_action_type_quick]').show();
                $("#zeus_token_action_type_quick").click();
                $('#zeus_card_list').show();
                $('#zeus_token_card_info').addClass('zeus_registar_padding');
                $('#register_zeus_credit').prop({disabled : true});
                $('#zeus_token_card_number, #zeus_token_card_expires_month, #zeus_token_card_expires_year, #zeus_token_card_name, #zeus_token_card_cvv')
                .addClass('zeus_token_input_disable').removeClass('zeus_token_input_error').prop({disabled : true});
            } else {
                // 登録済みカードが存在しない場合は非表示に設定
                $("#zeus_token_action_type_new").click();
                $('#zeus_token_action_type_quick').hide();
                $('label[for=zeus_token_action_type_quick]').hide();
                $('#zeus_registerd_card_area').hide();
                $('#zeus_token_card_info').removeClass('zeus_registar_padding');
            }

            // 定期ならカード登録のcheckbox出さない
            if (ref.regular) {
                $('#zeus_save_card_normal_tr').hide();
                $('#zeus_save_card_regular_tr').show();
            } else {
                $('#zeus_save_card_normal_tr').show();
                $('#zeus_save_card_regular_tr').hide();
            }

            // セキュリティコード
            ref.zeus_useable_securitycode = card_info.is_useable_securitycode;
            if(ref.zeus_useable_securitycode === true){
                $('#zeus_token_card_cvv').show();
                $('label[for="zeus_token_card_cvv"]').show();
                $('#zeus_token_card_cvv_for_registerd_card').show();
                $('label[for="zeus_token_card_cvv_for_registerd_card"]').show();
            }else{
                $('#zeus_token_card_cvv').hide();
                $('label[for="zeus_token_card_cvv"]').hide();
                $('#zeus_token_card_cvv_for_registerd_card').hide();
                $('label[for="zeus_token_card_cvv_for_registerd_card"]').hide();
            }

            // 登録カードを使用 && 確認画面から戻ってきた際の処理
            if ($('#zeus_payment_wallet_id').val()) {
                $('#zeus_token_action_type_quick').prop({checked : 'checked'});
                $('#zeus_card_list').show();
                $('#zeus_token_card_info').addClass('zeus_registar_padding');
                $('#register_zeus_credit').prop({disabled : true, checked : false});
                $('#zeus_payment_wallet_id_' + $('#zeus_payment_wallet_id').val()).prop({checked : 'checked'});
            }

            ref.zeus_credit_flg = true;

            if (!first) {
                return;
            }

            // 「登録済みのカードを使う」をチェックしたら、カード一覧を表示し、カード登録チェックボックスは非活性
            $('#zeus_token_action_type_quick').click(function() {
                if (ref.zeus_card_list !== undefined && Object.keys(ref.zeus_card_list).length > 0) { // r.card_listがhashなのでr.card_list.lengthではダメ
                    $('#zeus_card_list').show();
                    $('#zeus_registerd_card_area').show();
                    $('#zeus_token_card_info').addClass('zeus_registar_padding');
                    $('#register_zeus_credit').prop({disabled : true, checked : false});
                } else {
                    alert('登録済カードがありません。');
                    $('#zeus_token_action_type_new').prop({checked : true});
                    $('#zeus_token_card_number, #zeus_token_card_expires_month, #zeus_token_card_expires_year, #zeus_token_card_name, #zeus_token_card_cvv')
                    .removeClass('zeus_token_input_disable').addClass('zeus_token_input_error').prop({disabled : false});
                }
            });

            $('#zeus_token_action_type_new').click(function() {
                $('#zeus_card_list').hide();
                $('#zeus_registerd_card_area').hide();
                $('#zeus_token_card_info').removeClass('zeus_registar_padding');
                $('#register_zeus_credit').prop({disabled : false});
                $('#zeus_token_card_number, #zeus_token_card_expires_month, #zeus_token_card_expires_year, #zeus_token_card_name, #zeus_token_card_cvv')
                .removeClass('zeus_token_input_disable').addClass('zeus_token_input_error').prop({disabled : false});
            });
        },

        getGpPaygentCredit :  function (card_info) {
            if (!card_info.gp_paygent_credit_flg) {
                return;
            }

            var ref = this;

            // カード情報保持
            ref.gp_paygent_card_list = card_info.card_list;

            // カード情報入力フォーム表示
            $('#gp_paygent_token_card_info').show();

            // カードリスト表示用テンプレートを保持しておく
            var first = false;
            if (ref.gp_paygent_credit_card_list_template === null) {
                ref.gp_paygent_credit_card_list_template = $('#gp_paygent_card_list_body').html();
                first = true;
            }

            if (card_info.card_list !== undefined && Object.keys(card_info.card_list).length > 0) {
                // 初期標示　登録カードがあれば表示
                $('#gp_paygent_card_list_body').empty();
                for (var key in card_info.card_list) {
                    var html = ref.gp_paygent_credit_card_list_template;
                    html = html.replace('{{card_number}}', card_info.card_list[key].card_number);
                    html = html.replace('{{card_expire}}', card_info.card_list[key].card_expire);
                    html = html.replace('{{card_name}}', card_info.card_list[key].card_holder_name);
                    html = html.replace(/{{card_id}}/g, card_info.card_list[key].card_id);
                    $('#gp_paygent_card_list_body').append(html);
                }
                $('#gp_paygent_token_action_type_quick').show();
                $('label[for=gp_paygent_token_action_type_quick]').show();
                $('#gp_paygent_token_action_type_quick').prop({checked : 'checked'});

                $('#gp_paygent_card_list').show();
                $('.gp_paygent_entry_new_card').hide();

                $('#gp_paygent_token_card_number, #gp_paygent_token_card_expires_month, #gp_paygent_token_card_expires_year, #gp_paygent_token_card_name')
                .prop({disabled : true});

                $('#register_gp_paygent_credit').prop({disabled : true});
                $('.confirmation_save_card').hide();
            } else {
                // 登録済みカードが存在しない場合は非表示に設定
                $('#gp_paygent_token_action_type_new').prop({checked : 'checked'});
                $('#gp_paygent_token_action_type_quick').hide();
                $('label[for=gp_paygent_token_action_type_quick]').hide();
                $('.confirmation_save_card').show();
                $('.gp_paygent_token_action_type').hide();
            }

            // 定期ならカード登録のcheckbox出さない
            if (ref.regular) {
                $('#gp_paygent_save_card_normal_tr').hide();
                $('#gp_paygent_save_card_regular_tr').show();
                $('#register_gp_paygent_credit').prop({disabled : true});
            } else {
                $('#gp_paygent_save_card_normal_tr').show();
                $('#gp_paygent_save_card_regular_tr').hide();
                $('#register_gp_paygent_credit').prop({disabled : false});
            }

            // セキュリティコードを使うならフォームを表示
            ref.gp_paygent_useable_securitycode = card_info.is_useable_securitycode;
            if (card_info.is_useable_securitycode) {
                $('.gp_paygent_securitycode_area').show();
            } else {
                $('.gp_paygent_securitycode_area').hide();
            }

            // 支払い方法が分割の場合、分割回数を表示
            if ($('#payment_class').val() == $('#split_payment_class_dmy').val()) {
                // 定期の場合は支払回数は固定なので出さいない
                if (!ref.regular) {
                    $('#split_count_th, #split_count_tr').show();
                } else {
                    $('#split_count_th, #split_count_tr').hide();
                }
            }

            // 登録カードを使用 && 確認画面から戻ってきた際の処理
            if ($('#gp_paygent_payment_wallet_id').val()) {
                $('#gp_paygent_token_action_type_quick').prop({checked : 'checked'});
                $('#gp_paygent_card_list').show();
                $('#register_gp_paygent_credit').prop({disabled : true, checked : false});
                $('#gp_paygent_payment_wallet_id_' + $('#gp_paygent_payment_wallet_id').val()).prop({checked : 'checked'});
            }

            ref.gp_paygent_credit_flg = true;

            if (!first) {
                return;
            }

            // 「登録済みカードを使用する」をチェックしたら、カード一覧を表示し、カード登録チェックボックスは非活性
            $('#gp_paygent_token_action_type_quick').click(function() {
                if (ref.gp_paygent_card_list !== undefined && Object.keys(ref.gp_paygent_card_list).length > 0) {
                    // カードリストが存在する場合の処理
                    $('#gp_paygent_card_list').show();

                    // 「登録する」チェックボックスをdisabledにする
                    $('#register_gp_paygent_credit').prop({disabled : true, checked : false});
                } else {
                    alert('登録済カードがありません。');

                    // カードが存在しない場合入力欄活性
                    $('#gp_paygent_token_action_type_new').prop({checked : true});

                    // 各種カード情報入力欄非活性状態を解除する
                    $('#gp_paygent_token_card_number, #gp_paygent_token_card_expires_month, #gp_paygent_token_card_expires_year, #gp_paygent_token_card_name, #gp_paygent_token_card_cvv')
                    .prop({disabled : false});
                }

                // カード入力エリア非活性
                $('.gp_paygent_entry_new_card').hide();

                // カード登録のtr非活性
                $('.confirmation_save_card').hide();
            });

            // 「カード情報を入力する」をチェックした場合の処理
            $('#gp_paygent_token_action_type_new').click(function() {
                $('#gp_paygent_token_card_number, #gp_paygent_token_card_expires_month, #gp_paygent_token_card_expires_year, #gp_paygent_token_card_name, #gp_paygent_token_card_cvv')
                .prop({disabled : false});

                $('#gp_paygent_card_list').hide();
                $('#register_gp_paygent_credit').prop({disabled : false});

                // カード入力エリア非活性
                $('.gp_paygent_entry_new_card').show();

                // 都度定期共にカード登録のtr活性
                $('.confirmation_save_card').show();
            });
        },

        getGmopg : function (card_info) {
            if (!card_info.gmopg_credit_flg) {
                return;
            }

            var ref = this;

            // カード情報入力フォーム表示
            $('#gmopg_credit_block').show();

            // 登録カードリスト表示用テンプレートを保持しておく
            var first = false;
            if (ref.gmopg_credit_card_list_template === null) {
                ref.gmopg_credit_card_list_template = $('#gmopg_card_list_body').html();
                first = true;
            }

            // セキュリティコードを使うならフォームを表示
            ref.gmopg_useable_securitycode = card_info.is_useable_securitycode;
            if (card_info.is_useable_securitycode) {
                $('.gmopg_securitycode_area').show();
            } else {
                $('.gmopg_securitycode_area').hide();
            }

            // 登録カード表示
            if (card_info.card_list !== undefined && Object.keys(card_info.card_list).length > 0) {
                $('#gmopg_card_list_body').empty();
                for (var key in card_info.card_list) {
                    var html = ref.gmopg_credit_card_list_template;
                    html = html.replace('{{card_number}}', card_info.card_list[key].card_number);
                    html = html.replace('{{card_expire}}', card_info.card_list[key].card_expire);
                    html = html.replace('{{card_holder_name}}', card_info.card_list[key].card_holder_name);
                    html = html.replace(/{{card_id}}/g, card_info.card_list[key].card_id);
                    $('#gmopg_card_list_body').append(html);
                }
                $('#gmopg_token_action_type_quick').prop({checked : 'checked'});
                $('#register_gmopg_credit').prop({checked : false});
                $('.gmopg_form_input').prop({disabled : true});
                $('#gmopg_credit_list').show();
                $('.new_card_info_gmopg').hide();
            }

            // 定期ならカード登録のcheckbox出さない
            if (ref.regular) {
                $('#gmopg_save_card_normal_tr').hide();
                $('#gmopg_save_card_regular_tr').show();
            } else {
                $('#gmopg_save_card_normal_tr').show();
                $('#gmopg_save_card_regular_tr').hide();
            }

            // 登録カード枚数の上限に達していたら新規は非活性
            if (!card_info.card_add_space_available) {
                $('#gmopg_token_action_type_new').prop({disabled : true, checked : false});
                $('#notice_card_add').show();
            }

            // 登録カードを使用 && 確認画面から戻ってきた際の処理
            if ($('#gmopg_payment_wallet_id').val()) {
                $('#gmopg_token_action_type_quick').prop({checked : 'checked'});
                $('#gmopg_credit_list').show();
                $('#register_gmopg_credit').prop({disabled : true, checked : false});
                $('#gmopg_payment_wallet_id_' + $('#gmopg_payment_wallet_id').val()).prop({checked : 'checked'});
            }

            ref.gmopg_credit_flg = true;

            if (!first) {
                return;
            }

            // 「登録済みのカードを使う」をチェックしたら、カード一覧を表示し、カード登録チェックボックスは非活性
            $('#gmopg_token_action_type_quick').click(function() {
                if (card_info.card_list !== undefined && Object.keys(card_info.card_list).length > 0) {
                    $('#gmopg_credit_list').show();
                    $('#register_gmopg_credit').prop({checked : false});
                    $('.gmopg_form_input').prop({disabled : true});
                    $('.new_card_info_gmopg').hide();
                } else {
                    alert('登録済カードがありません。');
                    $('#gmopg_token_action_type_new').prop({checked : true});
                }
            });
            $('#gmopg_token_action_type_new').click(function() {
                $('#gmopg_credit_list').hide();
                $('.gmopg_form_input').prop({disabled : false});
                $('.new_card_info_gmopg').show();
                if (!card_info.is_useable_securitycode) {
                    $('.gmopg_securitycode_area').hide();
                }
            });
        },

        /**
         * LPフォームチェック処理
         */
        checkLp : function (product_id) {
            var ref = this;
            //商品ID有効性チェック
            if (!ref.isValidProductId(product_id)) {
                // どこで指定された商品IDかで区別する
                // data-value-nameか？
                var invalid_data_value_name_flg = false;
                if ($('.auto_select_name')[0]) {
                    $('.auto_select_name').each(function(){
                        if ($(this).attr('data-value-name') == undefined) {
                            return false;
                        }
                        if ($(this).attr('data-value-name') == product_id) {
                            invalid_data_value_name_flg = true;
                            return false;
                        }
                    });
                }

                if(invalid_data_value_name_flg) {
                    ref.inValidLp('invalid_data-value-name', product_id);
                } else {
                    ref.inValidLp('invalid_product_id', product_id);
                }
            }
        },

        /**
         * プロダクトID有効性チェック
         *
         * 引数に渡されたプロダクトIDが商品選択リストもしくはname="product_id"にある(有効)か否かを返します。
         */
        isValidProductId : function (product_id) {
            var is_valid_product_id = false;

            if ($('select#product_id')[0]) {
                // 商品リストあり、optionに商品IDがあるかチェック
                $('select#product_id option').each(function(){
                    if ($(this).val() == product_id) {
                        is_valid_product_id = true;
                    }
                });
            } else if ($('#product_id')[0]) {
                // select以外の指定
                $('#product_id').each(function(){
                    if ($(this).val() == product_id) {
                        is_valid_product_id = true;
                    }
                });
            } else {
                // チェックできない、有効とする
                is_valid_product_id = true;
            }

            return is_valid_product_id;
        },

        /**
         * LPフォーム不正時の処理
         */
        inValidLp : function (status, product_id) {
            var ref = this;

            var lp_form_key = $('input#unknown_classp').val();

            // 呼び出し元画面によってはlocation.hrefではlp_form_keyがない場合があるので、個別に連結して生成する
            var lp_form_url = location.protocol + '//' + location.host + location.pathname + '?p=' + lp_form_key

            var params =  {
                action      : 'lpFormError',
                product_id  : product_id,
                lp_form_url : lp_form_url,
                lp_form_key : lp_form_key,
                status      : status
            };

            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                if(originalOptions.type.toLowerCase() == 'post'){
                    options.data = jQuery.param($.extend(originalOptions.data||{}, {
                        timeStamp: new Date().getTime()
                    }));
                }
            });

            $.ajax({
                type : 'post',
                url  : ref.ajax_url,
                dataType: 'json',
                data : params,
                async : true, // 非同期通信させる
                headers: {
                    'pragma': 'no-cache'
                },
                timeout : 10000,
                success : function(r){
                    if(!r){
                        return false;
                    }
                    if(r.valid == false){
                        return false;
                    }
                },
            });
        },

        // confirm画面用 アップセルダイアログ表示
        showUpsDialog : function() {
            window.window_scrollTop = $(window).scrollTop();
            $('#lpshoppingcolumn.ups_dialog, #smp-lpshoppingcolumn.ups_dialog').dialog('open');
        },

        // selectbox内のoption要素の非表示化(iPhone,mac向け)
        hidePaymentDeliv : function(option){
            option.each(function(index, elm){
                if( elm.tagName === 'OPTION' ) {
                    let opt = elm;
                    if( $(elm).parent().get(0).tagName === 'SPAN' && $(elm).hasClass('payment_deliv')) {
                        let span = $(elm).parent().get(0);
                        $(span).hide();
                    } else if($(elm).hasClass('payment_deliv')) {
                        $(opt).wrap('<span>').hide();
                    }
                }
            });
        },

        // selectbox内のoption要素の表示化(iPhone,mac向け)
        showPaymentDeliv : function(option){
            option.each(function(index, elm){
                if( elm.tagName === 'OPTION' ) {
                    let opt = elm;
                    if( $(elm).parent().get(0).tagName === 'SPAN' && $(elm).hasClass('payment_deliv')) {
                        let span = $(elm).parent().get(0);
                        $(span).replaceWith(opt);
                        $(span).remove();
                    }
                }
            });
        },

        // AmazonPay v2用に保存しておく
        saveClassCategoryToSession : function(class_category_id, type) {
            var ref = this;
            $.ajax({
                type : 'post',
                url  : ref.ajax_url,
                dataType: 'json',
                data : {action : 'saveClassCategoryToSession', class_category_id : class_category_id, type : type},
                async : true, // 非同期通信させる
                headers: {
                    'pragma': 'no-cache'
                },
                timeout : 10000,
                success : function(r){
                    if(!r){
                        return false;
                    }
                    if(r.valid == false){
                        return false;
                    }
                },
            });
        },

        // #23556 ガイドライン準拠のためにカード番号下四桁だけ取得
        setSliceCardNumber :  function(card_number) {
            $('#slice_card_number').remove();
            $('#confirm_submit').prepend('<input type="hidden" name="slice_card_number" value="' + card_number.slice(-4)  + '" id="slice_card_number">');
        }
    };

    lp.init();
});

function lp_init(product_id, quantity, errors){
    lp.checkLp(product_id);

    lp.product_id = product_id;
    lp.quantity = quantity;
    lp.fetch_data(product_id, quantity, errors);
}

function setUserInfo(){
	lp.validate_flg = false; // バリデートは毎回行うため初期化
    var form = (location.pathname.indexOf('confirm') < 0) ? $('#form1').serializeArray() : $('#ups_dialog_form').serializeArray();
    var param = {action : 'validateAmazonPay', amazon_pay_flg : 1};
    $(form).each(function(i, v) {
        if (v.value) {
            param[v.name] = v.value;
        }
    });
    lp.validateLp(param);
    return lp.validate_flg;
}


// GET値を取得する
function getQueryString()
{
    var result = {};
    if( 1 < window.location.search.length )
    {
        var query = window.location.search.substring( 1 );

        var parameters = query.split( '&' );

        for( var i = 0; i < parameters.length; i++ )
        {
            var element = parameters[ i ].split( '=' );

            var paramName = decodeURIComponent( element[ 0 ] );
            var paramValue = decodeURIComponent( element[ 1 ] );

            result[ paramName ] = paramValue;
        }
    }
    return result;
}

// JSでエラー起こったとき用
function error_h(a,b,c){
    /*console.log(a);
    console.log(b);
    console.log(c);*/
    alert('エラーが発生しました。お手数ですが画面をリロード(再読込み)してください。');
    $('#confirm_submit').hide(); // この処理は必要ないかもしれないなあ
}

// site.jsの同名関数に問題があるので再定義
function fnModeSubmit(mode, keyname, keyid) {
    //ログイン時にカード欄に入力されているとpostされてしまうため
    if (mode === 'login' || mode === 'confirm') {
        deleteCardInformation();
    }
    if (location.pathname.indexOf('confirm') < 0) {
        document.form1['mode'].value = mode;
        if(keyname != "" && keyid != "") {
            document.form1[keyname].value = keyid;
        }
        document.form1.submit();
    } else {
        document.ups_dialog_form['mode'].value = mode;
        if(keyname != "" && keyid != "") {
            document.ups_dialog_form[keyname].value = keyid;
        }
        document.ups_dialog_form.submit();
    }
}

/**
 * カード情報を消す処理
 */
function deleteCardInformation () {
    // gmo
    if (document.getElementById("gmo_card_no") !== null
    || document.querySelector("gmo_card_no01") !== null) {
        // カード番号入力欄1つ
        if (document.getElementById("gmo_card_no") !== null) {
            document.getElementById("gmo_card_no").value = '';
        }
        // カード番号入力欄4つ
        if (document.getElementById("gmo_card_no01") !== null) {
            document.getElementById("gmo_card_no01").value = '';
            document.getElementById("gmo_card_no02").value = '';
            document.getElementById("gmo_card_no03").value = '';
            document.getElementById("gmo_card_no04").value = '';
        }
        // その他情報
        // PC
        if (document.querySelector("div.use_payarea input[name='card_name01']") !== null) {
            document.querySelector("div.use_payarea input[name='card_name01']").value = '';
            document.querySelector("div.use_payarea input[name='card_name02']").value = '';
            document.querySelector("div.use_payarea select[name='card_year']").value = '';
            document.querySelector("div.use_payarea select[name='card_month']").value = '';
        }

        // スマホ
        if (document.querySelector("div.bg_pay input[name='card_name01']") !== null) {
            document.querySelector("div.bg_pay input[name='card_name01']").value = '';
            document.querySelector("div.bg_pay input[name='card_name02']").value = '';
            document.querySelector("div.bg_pay select[name='card_year']").value = '';
            document.querySelector("div.bg_pay select[name='card_month']").value = '';
        }
    }
    // gmo pg
    if (document.getElementById("gmopg_token_card_number") !== null) {
        // カード番号
        document.getElementById("gmopg_token_card_number").value = '';
        // その他情報
        document.getElementById("gmopg_token_card_expires_month").value = '';
        document.getElementById("gmopg_token_card_expires_year").value = '';
        document.getElementById("gmopg_token_card_name").value = '';
        // セキュリティコード
        if (document.getElementById("gmopg_token_card_cvv") !== null) {
            document.getElementById("gmopg_token_card_cvv").value = '';
        }
    }
    // paygent
    if (document.querySelector("div#entry_new_card input[name='card_no']") !== null
    || document.querySelector("div#entry_new_card input[name='card_no1']") !== null) {
        // カード番号入力欄1つ
        if (document.querySelector("div#entry_new_card input[name='card_no']") !== null) {
            document.querySelector("div#entry_new_card input[name='card_no']").value = '';
        }
        // カード番号入力欄が4つ
        if (document.querySelector("div#entry_new_card input[name='card_no1']") !== null) {
            document.querySelector("div#entry_new_card input[name='card_no1']").value = '';
            document.querySelector("div#entry_new_card input[name='card_no2']").value = '';
            document.querySelector("div#entry_new_card input[name='card_no3']").value = '';
            document.querySelector("div#entry_new_card input[name='card_no4']").value = '';
        }
        // その他の情報
        document.querySelector("div#entry_new_card select[name='card_expiration_month']").value = '';
        document.querySelector("div#entry_new_card select[name='card_expiration_year']").value = '';
        document.querySelector("div#entry_new_card input[name='card_holder_name1']").value = '';
        document.querySelector("div#entry_new_card input[name='card_holder_name2']").value = '';
        // セキュリティコード（設定によって出力されたりされなかったり
        if (document.querySelector("div.use_payarea input[name='security_code']") !== null) {
            document.querySelector("div.use_payarea input[name='security_code']").value = '';
        }
    }
    // 新paygent
    if (document.getElementById("gp_paygent_token_card_number") !== null) {
        // カード番号
        document.getElementById("gp_paygent_token_card_number").value = '';
        // 有効期限
        document.getElementById("gp_paygent_token_card_expires_month").value = '';
        document.getElementById("gp_paygent_token_card_expires_year").value = '';
        // カード名義
        document.getElementById("gp_paygent_token_card_name").value = '';
    }
    // zeus
    if (document.getElementById("zeus_token_card_number") !== null) {
        // カード番号
        document.getElementById("zeus_token_card_number").value = '';
        // その他情報
        document.getElementById("zeus_token_card_expires_month").value = '';
        document.getElementById("zeus_token_card_expires_year").value = '';
        document.getElementById("zeus_token_card_name").value = '';
        // セキュリティコード
        if (document.getElementById("zeus_token_card_cvv") !== null) {
            document.getElementById("zeus_token_card_cvv").value = '';
        }
    }
}

// Getパラメータ取得
function getParam(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

class SelectPayment {
    constructor() {
        this.payment_id = '';
    }

    savePaymentId() {
        this.payment_id = $('#payment_id').val() || $('input[name=payment_id]:checked').val();
    }
}
