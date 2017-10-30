
(function ($) {

    $.fn.sGrid = function (settings) {
        var 
        	setting = setting || {},
			$this = this,
			setData = null,
			simulationAlaxFun = null,
            view = null,
			dataLength = 0,
			data = [],
			$table = null,
			nowP = 1, //目前頁數
			pageSize = 0,
			maxPageNum = 0,
            MAX_PAGE = 5, //總頁數
            findData = null,
            param = null
        ;
        //排序使用
        var orderStatus = 0,
            orderColumnName = '',
            orderIdx = '',

            ORDER_DEFAULT_STYLE = '^v',
            ORDER_ASC_STYLE = '^',
            ORDER_DESC_STYLE = 'v';

        defultValue();

        param = setting['param'];
        dataAjax();

        function defultValue() {
            var defaults = {
                pageSize: 10,
                param: {},
                gridKind: 'GRID',
                searchedFun: function (data, dataSize) {
                }
            };

            setting = $.extend({}, defaults, settings);
            setData = setting['data'];
            simulationAlaxFun = setting['simulationAlaxFun'];
            view = getView(setting['gridKind']);

        }

        function dataAjax() {
            //$this.html('');
            pageSize = setting['pageSize'];

            var url = setting['url'];


            if (setData) {
                var dataIdx = 0,
					max = nowP * pageSize,
					start = max - pageSize;
                maxPageNum = getMaxPageNum(setData.length);

                for (var i = start; i < max; i++) {
                    data[dataIdx++] = setData[i];
                }

                //drow view
                if (data) {
                    view.view(getFootHtm(), pageEvent, data);
                }

            }

            else if (url) {

                param['pageSize'] = pageSize;
                param['currentPage'] = nowP;
                $.ajax({
                    type: 'POST',
                    url: url,
                    dataType: 'json',
                    data: param,
                    success: function (ros) {
                        var dataSize = ros['DataCount'],
                                data = ros['Results'];
                        maxPageNum = getMaxPageNum(dataSize);
                        //drow view
                        if (data) {
                            view.view(getFootHtm(setting['gridKind']), pageEvent, data);
                        }


                        setting['searchedFun'](data, dataSize);

                        findData = data
                    }
                });
            }
        }

        function getView(kind) {
            if (kind == 'CONTENT_GRID') {
                return new ContentView(setting, $table, $this);
            }
            else if (kind == 'ROW_GRID') {
                return new RowView(setting, $table, $this);
            }
            else {
                return new View(setting, $table, $this);
            }
        }

        function getMaxPageNum(dataSize) {
            var mpn = Math.floor(dataSize / pageSize);
            return dataSize % pageSize == 0 ? mpn : mpn + 1;
        }



        function getFootHtm(gridKind) {
            if (gridKind !== 'ROW_GRID') {
                return '';
            }
            var space = '&nbsp;';
            var $first = $('<button type="button" class="btn btn-default" id="sp"><<</button> '),
				$left = $('<button type="button" class="btn btn-default" id="lp"><</button> '),
				$end = $('<button type="button" class="btn btn-default" id="ep">>></button> '),
				$right = $('<button type="button" class="btn btn-default" id="np">></button> '),
                colspan = setting['column'].length ? 'colspan="' + setting['column'].length + '""' : '',
				$nowPage = $('<tfoot><tr><td ' + colspan + ' class="footer-paging"  align="center" >'
                + '<div class="btn-group"></div>'
                + '</td></tr></tfoot>')
						.find('div'),
				otherPage = parseInt(MAX_PAGE / 2),
				max = maxPageNum,
				start = 1;

            //計算頁數永遠在中間
            if (maxPageNum < MAX_PAGE) {
                max = maxPageNum;
                start = 1;
            }
            else if (nowP < otherPage + 1) {
                max = MAX_PAGE;
                start = 1;
            }
            else if (nowP + otherPage >= maxPageNum) {
                max = maxPageNum;
                start = max - MAX_PAGE + 1;
            }
            else {
                max = nowP + otherPage;
                start = max - MAX_PAGE + 1;
            }

            if (start >= max) {
                return $nowPage;
            }

            $nowPage.append($first, '  ', $left);
            //var dropdownMenu
            for (var i = start; i <= max; i++) {
                var $page = $('<button type="button" class="btn btn-default pg">' + i + '</button> ' + space);
                $page.data('pp', i); //記錄目前頁數的屬性

                if (i == nowP) {
                    $page.removeClass('btn-default', 'pg');

                    $page.addClass('btn-danger');
                }
                $nowPage.append($page);
            }
            $nowPage.append($right, $end);
            return $nowPage;
        }


        function pageEvent() {
            $this.find('#sp').click(function (e) {
                if (nowP === 1) {
                    return;
                }
                nowP = 1;
                dataAjax();
            });
            $this.find('#lp').click(function (e) {
                if (nowP === 1) {
                    return;
                }
                nowP--;
                dataAjax();
            });
            $this.find('#np').click(function (e) {
                if (nowP === maxPageNum) {
                    return;
                }
                nowP++;
                dataAjax();
            });
            $this.find('#ep').click(function (e) {
                if (nowP === maxPageNum) {
                    return;
                }
                nowP = maxPageNum;
                dataAjax();
            });
            $this.find('.pg').click(function (e) {
                var val = $(this).data('pp');
                if (val == nowP) {
                    return;
                }
                nowP = val;
                dataAjax();
            });
            $this.find('.lp').click(function (e) {
                var val = $(this).data('pp');
                if (val == nowP) {
                    return;
                }
                nowP -= 4;

                if (nowP <= 1) {
                    nowP = 1;
                }
                dataAjax();
            });
            $this.find('.rp').click(function (e) {
                var val = $(this).data('pp');
                if (val == nowP) {
                    return;
                }
                nowP += 4;
                if (nowP >= maxPageNum) {
                    nowP = maxPageNum;
                }
                dataAjax();
            });
            $this.find('.order').click(function (e) {
                var $tr = $(this),
                    item = $tr.data('column'),
                    columnIdx = $tr.data('columnIdx');
                //排序 0:預設,1:asc,2:desc
                orderStatus = orderStatus >= 2 ? 0 : orderStatus + 1;
                if (orderIdx !== columnIdx) {
                    orderStatus = 1;
                }

                //記錄欄位的index
                orderIdx = columnIdx;
                param['orderColumn'] = item['data'];
                if (orderStatus == 0) {
                    delete param['orderColumn'];
                    delete param['asc'];
                }
                else if (orderStatus == 1) {
                    param['asc'] = 'asc';
                }
                else if (orderStatus == 2) {
                    param['asc'] = 'desc';
                }

                dataAjax();
            });
        }


        function View(setting, $table, $this) {

            this.view = function (footHtm, pageEvent, data) {
                if (!$this.find('div table').html()) {
                    init();
                    drawHeader();
                }
                drawBody(data);

                $table.find('.btn-group').remove()
                $table.append(footHtm);
                pageEvent();
            }

            function init() {

                $table = $this
					.append($('<div class="table-wrapper"><table></table></div>'))
                    .find('div table');

                if (setting['title']) {
                    $table.before($('<h4>' + setting['title'] + '</h4><hr>'));
                }
                else if (setting['titleTemplate']) {
                    $table.before($('' + setting['titleTemplate']() + ''));
                }
            }

            function drawHeader() {

                var $tr = $table
                            .append($('<thead><tr></tr></thead>'))
                            .find('thead tr');

                $.each(setting['column'], function (idx, item) {
                    var title = null;
                    if (item['title']) {
                        title = item['title'];
                    }
                    else if (item['titleTemplate']) {
                        title = item['titleTemplate']();
                    }
                    else {
                        title = item['data'];
                    }

                    var $th = $('<th>' + title + '</th>')
                        .css({
                            'width': item['width']
                        });
                    $tr.append($th);
                });
            }

            function drawBody(data) {
                if (!data || data.length == 0) {
                    return;
                }

                var $tbody = $table.find('tbody').remove();
                $tbody = $table
                        .append($('<tbody></tbody>'))
                        .find('tbody');
                $.each(data, function (idx, dataValue) {

                    var $tr = $tbody
                        .append($('<tr id="tr' + idx + '"></tr>'))
                        .find('#tr' + idx),
                        tdCss = '';

                    $.each(setting['column'], function (idx, item) {
                        tdCss = '';
                        if (item['tdCss']) {
                            tdCss = ' class="' + item['tdCss'] + '"';
                        }
                        if (!dataValue) {
                            $tr.append($('<td ' + tdCss + '>&nbsp</td>'));
                            return;
                        }
                        var dataName = item['data'],
                            template = item['template'],
                            view = null;

                        if (dataName) {
                            view = dataValue[dataName];
                        }
                        if (template) {
                            view = template(dataValue);
                        }
                        $tr.append($('<td ' + tdCss + '>' + view + '</td>'));

                    });
                });

            }
        }




        function ContentView(setting, $table, $this, data, pageEvent) {

            this.view = function (footHtm, pageEvent, data) {
                init();
                drawHeader();
                drawBody(data);

                $table.append(footHtm);


                pageEvent();
            }

            function init() {
                $table = $this
                    .append($('<div class="tab-content"><div role="tabpanel" class="tab-pane active" id="tab_info">' +
                    		'<table class="table table-gray"></table>' +
                            '</div></div>'))
                    .find('div table');
            }

            function drawHeader() {
            }

            function drawBody(data) {
                var $ul = $table
                        .append($('<tr><td><ul class="list-unstyled my-notification"></ul></td></tr>'))
                        .find('ul');
                $.each(data, function (idx, ddata) {
                    if (!ddata) {
                        return 0;
                    }
                    var $li = $ul
                        .append($('<li id="li' + idx + '"></li>'))
                        .find('#li' + idx),
                        template = setting['column']['template'](idx, ddata);
                    if (template) {
                        $li.append($(template));
                    }


                });

            }
        }


        function RowView(setting, $table, $this, data, pageEvent) {



            this.view = function (footHtm, pageEvent, data) {

                $this.empty();
                $table = $('<table class="table table-striped">');
                drawHeader($table);

                drawBody(data);

                $this.append($table, footHtm);
                pageEvent();
            }

            function init() {
                if ($table) {
                    return;
                }
                $table = $this
					.append($('<table class="table table-striped">'))
                    .find('table');

            }

            function drawHeader($table) {

                var $tr = $('<tr></tr>'),
                    $thead = $('<thead></thead>');



                $tr.append($('<th>#</th>'));
                $.each(setting['column'], function (idx, item) {
                    var title = null,
                        order = null,
                        columnname = item['data'];
                    if (item['title']) {
                        title = item['title'];
                    }
                    else if (item['titleTemplate']) {
                        title = item['titleTemplate']();
                    }
                    else {
                        title = item['data'];
                    }


                    var $th = $('<th>' + title + '</th>')
                        .css({ 'width': item['width'] });

                    if (item['order']) {
                        $th
                            .css({ 'cursor': 'pointer' })
                            .addClass('order')
                            .data('column', item)
                            .data('columnIdx', idx)
                            .text(title + ' ' + ORDER_DEFAULT_STYLE);
                    }

                    if (orderIdx === idx) {
                        if (orderStatus == 0) {
                            $th.text(title + ' ' + ORDER_DEFAULT_STYLE);
                        }
                        else if (orderStatus == 1) {
                            $th.text(title + ' ' + ORDER_ASC_STYLE);
                        }
                        else if (orderStatus == 2) {
                            $th.text(title + ' ' + ORDER_DESC_STYLE);
                        }
                    }

                    $tr.append($th);
                });


                $thead.append($tr);
                $table.find('thead').remove();

                $table.append($thead);
            }

            function drawBody(data) {

                if (!data || data.length == 0) {
                    return;
                }
                var $tbody = $('<tbody></tbody>');
                var row = (nowP - 1) * pageSize;
                $.each(data, function (idx, dataValue) {

                    var $tr = $tbody
                        .append($('<tr id="tr' + idx + '"></tr>'))
                        .find('#tr' + idx),
                        tdCss = '';

                    row++;
                    $tr.append($('<th>' + row + '</th>'));
                    $.each(setting['column'], function (idx, item) {
                        tdCss = '';
                        if (item['tdCss']) {
                            tdCss = ' class="' + item['tdCss'] + '"';
                        }
                        if (!dataValue) {
                            $tr.append($('<td ' + tdCss + '>&nbsp</td>'));
                            return;
                        }
                        var dataName = item['data'],
                            template = item['template'],
                            view = null;

                        if (dataName) {
                            view = dataValue[dataName];
                        }

                        if (template) {
                            view = template(dataValue);
                        }

                        if (view == null) {
                            view = '';
                        }

                        $tr.append($('<td ' + tdCss + '>' + view + '</td>'));

                    });

                });

                $('table').find('tbody').remove();
                $table.append($tbody);

            }
        }



        return {
            'settings': settings,
            'getData': function () {
                return findData;
            },
            'reBuildData': function (param) {
                nowP = 1
                defultValue();
                if (param) {
                    setting['param'] = $.extend({}, setting['param'], param);
                }
                dataAjax();
            },
            'reLoadDataNotChangePage': function () {
                dataAjax();
            }
        };
    }

})(jQuery)
