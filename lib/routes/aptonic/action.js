import got from '~/utils/got.js';
import url from 'url';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        untested = false
    } = ctx.params;

    const getItems = async (link) => {
        const res = await got.get(link);
        const $ = cheerio.load(res.body);

        return $('table.actions >> tr')
            .get()
            .map((item) => {
                item = $(item);
                return {
                    title: item.find('h2').text(),
                    description: `<img src="${url.resolve(link, item.find('img').attr('src'))}"/><br/>${$(item.find('td')[1]).children().remove().end().text()}`,
                    pubDate: new Date().toUTCString(),
                    link: url.resolve(link, item.find('td.icon a').attr('href')),
                };
            });
    };

    const link = `https://aptonic.com/actions/`;

    const items = await getItems(link);

    if (untested) {
        items.push(...(await getItems('https://aptonic.com/actions/untested')));
    }

    ctx.state.data = {
        title: 'Dropzone Actions',
        link,
        item: items,
    };
};