import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatOddsDataToMatch, getDateWindow } from '../lib/the-odds-api';

describe('formatOddsDataToMatch', () => {
    it('maps The Odds API h2h outcomes into Home/Draw/Away odds in the app format', () => {
        const match = formatOddsDataToMatch({
            id: 'evt-1',
            sport_key: 'soccer_epl',
            sport_title: 'English Premier League',
            commence_time: '2026-07-20T20:00:00Z',
            home_team: 'Arsenal',
            away_team: 'Chelsea',
            bookmakers: [
                {
                    key: 'bet365',
                    title: 'Bet365',
                    last_update: '2026-07-20T19:55:00Z',
                    markets: [
                        {
                            key: 'h2h',
                            last_update: '2026-07-20T19:55:00Z',
                            outcomes: [
                                { name: 'Arsenal', price: 2.1 },
                                { name: 'Draw', price: 3.4 },
                                { name: 'Chelsea', price: 3.8 },
                            ],
                        },
                    ],
                },
            ],
        } as any);

        assert.equal(match.homeTeam, 'Arsenal');
        assert.equal(match.odds[0].selection, 'Home');
        assert.equal(match.odds[0].value, 2.1);
        assert.equal(match.odds[1].selection, 'Draw');
        assert.equal(match.odds[2].selection, 'Away');
    });

    it('builds a future date window starting from today', () => {
        const dates = getDateWindow(new Date('2026-07-20T00:00:00.000Z'), 3);
        assert.deepEqual(dates, [
            '2026-07-20',
            '2026-07-21',
            '2026-07-22',
            '2026-07-23',
        ]);
    });
});
