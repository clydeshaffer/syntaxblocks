syntaxblocks
============

Experimental UI for mobile touchscreen code viewing/authoring

The idea:
  Coding on mobile phone keyboards is usually awful. However, this doesn't stop avid programmers from getting
  bored at airports, bus stops, train stations, weddings, funerals, presidential inagurations, etc. Traditional
  "type it all out" coding doesn't work on the tiny screen for at least a few reasons:
  
    - Code on the computer screen can afford to depend on whitespace for clarity
      -on the tiny screen this makes for either very small fonts or a LOT of scrolling just to read one line
      -tiny screen places space at a massive premium 
    - TIAO coding benfits greatly from either mouse usage or MLG_PROSTATUS_VIM_SHORTCUTS_360, that
      only make sense on a physical keyboard
      - even the most nimble fingers will feel like hotdogs trying to click specific places in your code
      - keyboard shortcuts lose their efficiency when you have to hunt and peck them on the screenkeyboard
    - Formatting is an enormous pain on tiny touch screens. So is typing out the syntax of most programming
      languages.
      
  Considering these problems, a usable IDE for your phone would need to do the following:
    - Use screen real estate efficiently
    - Interactions that require poking a specific place on the screen should have LARGE targets
    - Formatting should be as automatic as possible
    - Time spent typing with the onscreen keyboard should be minimized.
  
  SyntaxBlocks is an exploration of these objectives. The premise of SyntaxBlocks is that instead of Typing It All
    Out, a programmer can work directly with the Abstract Syntax Tree. To make efficient use of screen space and
    for ease of navigation, the AST is represented by interpreting it as a Space Partitioning Tree. This creates
    a recursive overview of the source in which all major sections become apparent. When a section is zoomed in,
    the subsections of THAT section quickly become apparent, as well as the relative density/complexity of each.
    
Current status:

  The current prototype isn't capable of writing new code, but it can parse arbitrary Javascript using Esprima and
  render a space-partitioning representation of the code. Code can be examined by tapping/clicking on sections to
  zoom in, and swiping right (like "back" gesture on mobile safari) to go back up a level. The next prototype will
  almost certainly be a rewrite, and be preceded by experimental interaction prototypes for specifying program
  behavior.
  
