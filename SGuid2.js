
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

            ORDER_DEFAULT_STYLE = '<i class="fa fa-sort" aria-hidden="true"></i>',
            ORDER_ASC_STYLE = '<i class="fa fa-sort-asc" aria-hidden="true"></i>',
            ORDER_DESC_STYLE = '<i class="fa fa-sort-desc" aria-hidden="true"></i>';

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
            if (kind == 'ROW_GRID') {
                return new RowView(setting, $table, $this);
            }
            else {
                return new RowView(setting, $table, $this);
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
				$nowPage = $('<div class="btn-group"></div>'),
                $tfoot = $('<tfoot><tr><td ' + colspan + ' class="footer-paging"  align="center" ></td></tr></tfoot>'),
                otherPage = parseInt(MAX_PAGE / 2),
				max = maxPageNum,
				start = 1;

            $tfoot.append($nowPage);

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
                $table = $('<table class="table table-striped">');
                $this.append($table);

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
                            .html(title + ' ' + ORDER_DEFAULT_STYLE);
                    }

                    if (orderIdx === idx) {
                        if (orderStatus == 0) {
                            $th.html(title + ' ' + ORDER_DEFAULT_STYLE);
                        }
                        else if (orderStatus == 1) {
                            $th.html(title + ' ' + ORDER_ASC_STYLE);
                        }
                        else if (orderStatus == 2) {
                            $th.html(title + ' ' + ORDER_DESC_STYLE);
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
                $.each(data, function (rowIdx, dataValue) {

                    row++;
                    var $tr = $('<tr id="_row_' + row + '"></tr>'),
                        tdCss = '';

                    if (setting['trCss']) {
                        $tr.addClass(setting['trCss']);
                    }
                    $tbody.append($tr);

                    $tr.append($('<th></th>').prop({ 'id': 'row' }).html(row));
                    $tr.append($('<td></td>').css({ 'display': 'none' }).prop({ 'id': 'rowIdx' }).html(rowIdx));
                    $.each(setting['column'], function (columnIdx, item) {

                        dataValue['__gridInfo'] = {
                            __no: row,
                            __dataColumnIndex: columnIdx,
                            __dataRowIndex: rowIdx
                        };
                        dataValue['DataRowIndex'] = function () {
                            return rowIdx;
                        };

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

                $table.find('tbody').remove();
                $table.append($tbody);

            }
        }

        return {
            '$this': this,
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
