$(document).ready(function () {
    $("form").ajaxForm({
        headers: {
            'X-User-Access-Key': $('#access_key').val(),
            'X-User-Access-Token': $('#access_token').val()
        },
        success: function (data) {
            const dlg = $('#result-dlg');

            dlg.find('.modal-body').html("<pre><code class='json'>" + JSON.stringify(data, null, 1) + "</code></pre>");
            dlg.modal();

            dlg.find('pre code').each(function (i, block) {
                hljs.highlightBlock(block);
            });
        },
        error: function (jqXHR) {
            const dlg = $('#result-dlg');

            dlg.find('.modal-body').html("<pre class='error'>" + jqXHR.responseText + "</pre>");
            dlg.modal();
        }
    });
});