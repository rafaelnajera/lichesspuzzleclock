# lichesspuzzleclock
A Violentmonkey user script that adds a clock/timer to lichess puzzles. 

## Installation

Install from URL in Violentmonkey:  

`https://rafaelnajera.github.io/lichesspuzzleclock/lichesspuzzleclock.js`

Or, create a new user script in Violentmonkey and replace its contents with 
the contents of [lichesspuzzleclock.js](lichesspuzzleclock.js)


## Usage
The clock/timer will appear on top of the chess board. 

![toolbar](images/toolbar.png)

There are three timer buttons: B, R and C, standing for Blitz, Rapid and Classic. 
The button marked with an infinite sign starts a normal, count-up clock.

By default, the timers are set to B = 10sec, R = 30sec and C = 3min, but these can be changed 
in Violentmonkey after the script is run for the first time. 
Go to Violentmonkey's settings, click on the `</>` icon for the script and choose the "Values"
tab. All the script parameters are stored there.

When using a timer, if the "AF" checkbox is checked, the script will automatically
fail the current puzzle when time runs out. If not, when time runs out the
clock display will turn red and will show the time elapsed as a normal clock.

When time has not yet run out, the timer can be cancelled by clicking on the infinite
button. The clock switches to displaying the elapsed time.

If you want one of the timers (or the normal clock) to start automatically with
each new puzzle, select the desired timer in the "Auto" dropdown menu. The
selected timer will auto-start in the next puzzle.

## Why Timed Puzzles?

The idea with adding a time constraint to puzzles should **not** be to put yourself more 
pressure and make you rush through the puzzle guessing one move at a time in desperation, but, 
of course, you can use the timers that way. We all know it's a lot of fun.

One **good** use of a timer, on the other hand, is to help you find out which puzzles you 
cannot solve within a certain period of time. You can then study those, and gradually be able 
to solve harder puzzles within that time constraint. 

For timers of about 30sec or less this will help you find out, study and 
internalize tactical patterns since it is virtually impossible to solve a tactical 
puzzle in such a low time if you don't recognize the tactical pattern or 
patterns in the puzzle very quickly without calculation. A 10sec or less timer 
will probably force you to work on your mouse dexterity too!

Simply solve each puzzle normally, trying to see the whole solution before making 
your moves. If you could not solve it, study the solution, go over it 2-3 times, 
visualize it in your head 2-3 more times and move on to the next. It is said
that finding and studying 3 of these failed puzzles per day will slowly build your
arsenal of tactical patterns very efficiently over a 1-2 year period. A 30sec timer is 
recommended of this purpose. David Pruess describes this technique in his YouTube video
[_How to Learn Tactics 1_](https://youtu.be/Mvkuji08dMc). For the same ideas explained in German, 
see David Riemay's (a.k.a. Schachpanda) [_So lernt ihr Schach Taktik_](https://youtu.be/_25i84yD6Uc) video. 

Longer timers will reveal tactical weaknesses due to lack of tactical patterns 
and problems with visualization and calculation. They will give you an idea of the 
kind of tactical problems you might be able to solve in longer time controls and compel
you to be more efficient in your solving. People with chronic time pressure problems in 
longer games may benefit a lot from this. 

## Why 10s, 30s and 3 min? 

These values are derived from a calculation of the average time available per move in 
blitz games, rapid games and (FIDE) classical games, with some liberties so that they 
have nicely rounded values. There is no hyper sophisticated or transcendental reasoning 
behind it.

Most chess games are over in less than 45 moves, so we can calculate time available on 
a 45 move basis. For a 15+10 rapid game, for example, you have 15' + 45x10" = 22'30" for
the whole game. That's 30" per move, which is the default Rapid timer. 

This is, obviously, just a ballpark figure. Normally you will play your  opening prep moves much faster, so in reality in a game you have 
a bit more time per move. For example, if you can play your first 9  moves very fast, you will 
have about 36" per move  for the rest of a 45-move game. Also, of course, some games  will end 
much sooner, and some might go into an endgame (in which you might have only your 10" 
increment available). 

In any case, the same calculation yields 9" per move for a 5+3 blitz game. So 10" is a nice
round number for the Blitz timer. For a 3+2 game you have about 6" per move. 

For the classical timer, the basis is a 90+30 game, but in this case it is assumed that you
will play your first 8-9 moves faster. Without that assumption the time available per move 
should be 2'30".  

There is, of course, no reason to attach any particular meaning to the B, R and C buttons. 
As indicated in the Usage section above, you can set the timers to whatever you want.


## Author and Credits

Developed by Rafael Nájera ([https://rafaelnajera.com/](https://rafaelnajera.com/)), a 50+ year
old beginner chess player who happens to know some Javascript. 
He is on Lichess, of course: [https://lichess.org/@/RafaelNajera](https://lichess.org/@/RafaelNajera)

Based on Hugo Platzer's script [Lichess timed puzzles](https://greasyfork.org/en/scripts/380560-lichess-timed-puzzles)




