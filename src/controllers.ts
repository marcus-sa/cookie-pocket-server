import { Request, Response } from 'express';
import * as puppeteer from 'puppeteer';
import * as url from 'url';

export const index = (req: Request, res: Response) => res.send('Hello!');

const scans = new Map<string, puppeteer.Cookie[]>();

/*
* {
*   url: string
*   refetch?: boolean
* }
* */
export const sniff = async (req: Request, res: Response) => {
	if (scans.has(req.body.url) && !req.body.refetch) {
		return res.json({
			fromCache: true,
			cookies: scans.get(req.body.url)
		});
	}

	const fragments = url.parse(req.body.url);
	if (!fragments.hostname) {
		return res.status(400).send(`Invalid url: ${req.body.url}`);
	}

	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	// @TODO: Find all links that go to subdomains
	// and scan them aswell
	await page.goto(req.body.url, {
		// if any scripts will append cookies of some sort
		// wait until everything on website has loaded
		waitUntil: ['load', 'networkidle0']
	});

	const cookies = await page.cookies();

	await browser.close();

	scans.set(req.body.url, cookies);

	return res.json({
		fromCache: false,
		cookies
	});
};