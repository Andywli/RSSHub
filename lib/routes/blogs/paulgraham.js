import got from '~/utils/got.js';
import parser from '~/utils/rss-parser';
import cheerio from 'cheerio';

const ProcessFeed = async (link) => {
    const response = await got({
        method: 'get',
        url: link,
    });

    const $ = cheerio.load(response.data);

    // 提取内容
    return $('font').html();
};

export default async (ctx) => {
    const feed = await parser.parseURL('http://www.aaronsw.com/2002/feeds/pgessays.rss');

    const items = await Promise.all(
        feed.items.slice(0, 5).map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return JSON.parse(cache);
            }

            const description = await ProcessFeed(item.link);

            const single = {
                title: item.title,
                description,
                link: item.link,
                author: item.author,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return single;
        })
    );

    ctx.state.data = {
        title: feed.title,
        link: 'http://www.paulgraham.com/articles.html',
        description: 'Essays by Paul Graham',
        item: items,
    };
};