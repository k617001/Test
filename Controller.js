
$.fn.Controller = function (actionSet) {

    //清空欄位 
    this.columnClean = function () {
        $(':input', this.selector)
			 .not(':button, :submit, :reset, :hidden, :checkbox, :radio')
			 .val(null);
        $('input[type="checkbox"],input[type="radio"]')
			 .removeAttr('checked')
			 .removeAttr('selected');
    }

    //把form組成json
    this.formJson = function () {
        var formArray = this.serializeArray(),
		    indexed_array = {};

        $.map(formArray, function (n, i) {
            var name = n['name'],
                value = n['value'],
                indexedAryValue = indexed_array[name];

            if (indexedAryValue) {
                if (!Array.isArray(indexedAryValue)) {
                    indexed_array[name] = [indexedAryValue, value];
                }
                else {
                    indexed_array[name].push(value);
                }
                return;
            }
            indexed_array[name] = value;
        });
        return indexed_array;
    }

    //設定值到form(name名稱相同)
    this.setFormValue = function (formData) {
        for (name in formData) {
            var $input = this.find("input[name='" + name + "'],select[name='" + name + "']"),
                        type = $input.prop('type'),
                        value = formData[name];

            if (type === 'checkbox') {
                for (var i in value) {
                    this.find('input[name="' + name + '"][value="' + value[i] + '"]').prop('checked', true);
                }
            }
            else if (type === 'radio') {
				this.find('[value="' + value + '"]').prop('checked', true);
            }
            else {
                $input.val(value);
            }
        }
    }

    //ajax呼叫，統一錯誤訊息json格式的方法
    this.ajaxCall = function (setting) {
        return $.ajax(setting)
				  .fail(function (ros) {
				      var failMsgData = JSON.parse(ros.responseText);
				      alert(failMsgData);
				  });
    }

    //欄位驗証的設定
    this.validate();
	var $valid = $.validator;
    $.extend($valid.messages, {
        required: "此欄位必填!!",
        remote: "Please fix this field.",
        email: "請填寫正確的 E-mail 格式",
        url: "請填寫正確的 URL 格式",
        date: "請輸入日期 格式 yyyy/MM/dd",
        dateISO: "Please enter a valid date ( ISO ).",
        number: "請輸入數字",
        digits: "Please enter only digits.",
        creditcard: "Please enter a valid credit card number.",
        equalTo: "Please enter the same value again.",
        maxlength: $valid.format("Please enter no more than {0} characters."),
        minlength: $valid.format("Please enter at least {0} characters."),
        rangelength: $valid.format("Please enter a value between {0} and {1} characters long."),
        range: $valid.format("Please enter a value between {0} and {1}."),
        max: $valid.format("Please enter a value less than or equal to {0}."),
        min: $valid.format("Please enter a value greater than or equal to {0}.")
    });

	$valid.addMethod(
		"dateValid",
		function(value, element) {
			var check = false;
			var re = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
			if( re.test(value)){
				var adata = value.split('/');
				var yyyy = parseInt(adata[0],10);
				var mm = parseInt(adata[1],10);
				var dd = parseInt(adata[2],10);
				var xdata = new Date(yyyy,mm-1,dd);
				if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) )
					check = true;
				else
					check = false;
			} else
				check = false;
			return this.optional(element) || check;
		},
		"日期格式錯誤 yyyy/mm/dd"
	);

    //呼叫action
    if (actionSet.action) {
        actionSet.action(this);
    }

    return this;
}
