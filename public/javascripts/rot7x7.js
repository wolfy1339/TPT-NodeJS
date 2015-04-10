function rot( t, u, v ) {
 return String.fromCharCode( ( ( t - u + v ) % ( v * 2 ) ) + u );
}
function rot7( s ) {
 var b = [], c, i = s.length,
  a = 'a'.charCodeAt(), z = a + 26,
  A = 'A'.charCodeAt(), Z = A + 26;
 while(i--) {
  c = s.charCodeAt( i );
  if( c>=a && c<z ) { b[i] = rot( c, a, 7 ); }
  else if( c>=A && c<Z ) { b[i] = rot( c, A, 7 ); }
  else { b[i] = s.charAt( i ); }
 }
 return b.join( '' );
}
function rot7x7(s) {
 return rot7(rot7(rot7(rot7(rot7(rot7(rot7(s)))))));
}