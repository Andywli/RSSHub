import url from 'url';
import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const link = `http://www.caict.ac.cn/kxyj/qwfb/qwsj/`;
    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(response.data);
    const list = $('td[width="540"]')
        .map((_, item) => {
            item = $(item);
            const a = item.find('a');
            return {
                title: a.text(),
                link: url.resolve(link, a.attr('href')),
                pubDate: item.next().find('span.kxyj_text').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: '中国信息通信研究院 - 权威数据',
        link,
        item: list,
    };
};