const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Clone = require('../../util/clone');
const Cast = require('../../util/cast');
const request = require('request');
const SocketIO = require('socket.io-client');


const BASE_URL = 'http://35.169.45.24:6456';
// http://35.169.45.24:6456/attributes/alexa?attribute=color
// const BASE_URL = 'http://eesh.me:6456';
// const BASE_URL = 'http://35.169.45.24:6456';
const LOGIN_URL = `${BASE_URL}/user/login`;
const REGISTER_URL = `${BASE_URL}/user/register`;
const ALEXA_ATTRIBUTES_URL = `${BASE_URL}/attributes/alexa`;
const USER_ATTRIBUTES_URL = `${BASE_URL}/attributes/user`;
const USER_MESSAGES_URL = `${BASE_URL}/messages/user`;

let USER_AUTH_TOKEN = null;
let USER_ACCESS_CODE = null;

let blockSet1Execute = false;
let blockSet2Execute = false;
let blockSet3Execute = false;

let socket = null;

const iconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAYAAAD0eNT6AAAn+ElEQVR42uzdTYokuRmHcR+hjtBH6CP4CHWEPoKPUDfo/WzaO69ML7zzpr3yzvTCA2bAUBiMDWagYDAYG0ONnmY0HVNTXZGZkt58pXgCfhhPV2YqvqS/FBGKX3Rfvvr6prgt7ooPxX3xKEmSTnZffCjuittPbWvKpRSseFO8T7LhJElazfviTY4w8NXXr4q3xUOSjSNJ0uoeiref2uDgpfb475JsCEmSjuoubESAaxH2+CVJSuOhuB3d63+XZGUlSRI+e1fcjGj8PyZZQUmS9LyPxU2vxv+1Q/6SJE3joXht4y9J0vFcHgIYQrDxlyRpWg/Fjdf8JUk6nvPuCfBuf0mSlvHu5Of8kxRYkiT1cet1f0mSjufl+wGc3leSpGXdffHFPkkKKEmSxnj1XAB4m6RwkiRpjLde+5ck6XgeipttAHiTpGCSJGmsN9sA8D5JoSRJ0ljvfxz+T1IgSZIU48aJfyRJOp5bn/2XJOl47ggAH5IURpIkxfhAALhPUhhJkhSBtj9JQSRJUiADgCRJR5SiEJIkyQAgSZIMAJIkyQAgSZIMAJIkyQAgSZIMAJIkyQAgSZIMAJIkHVWKQkiSJAOAJEkyAEiSJAOAJEkyAEiSJAOAJEkyAEiSJAOAJEkyAEiSdFQpCiFJkgwAkiTJACBJkgwAkiTJACBJkgwAkiTJACBJkgwAkiTJACBJ0lGlKIQkSTIASJIkA4AkSTIASJIkA4AkSTIASJIkA4AkSTIASJIkA4AkSUeVohCSJMkAIEmSDACSJMkAIEmSDACSJMkAIEmSDACSJMkAIEmSDACSJB1VikJIkiQDgCRJMgBIkiQDgCRJMgBIkiQDgCRJMgBIkiQDgCRJMgBIknRUKQqhk736zTePv/zd/Y9e//avKcqlfDg+tm5+/ZcU5ZKURIpC6CeoqKmw7/70r8f39989fvz2P4+nLPwdf/+rP/5ziWDANmBd6nb48I9/P7775oH/P2Qd+b43f/j7p+9/++dv+T1+t/4e5UmxXZ4rcy3vw3///7i38Df8LZ+5/f3fDAYxx3I9tsD23x7PYF8Q8FOUt/P5y3puzyekPJ8OJ0UhRCVMBfHpBOm0UNFz4o0MAzWo7Dn5pKcCpMyU/ZTl/rv/8b2XNmL8Hp/ne87ZpqzHVRt9Gm/K3GkhPHL8jQwDfD+NQBrlXKPRTXc+s1+DjrEaSk7FevU8f1n4e8OAAeCYtifMwIUKr/tJRuV5wUI5nqswadRawg69jZ0yd/u9uk0jR1qorPdHg9pDY63ouwfFrAtl630+d1oIA+z3EccTx/8l5Rl5Pi01AjKFFIU4KCpaKtzAhR4JJ2u38l+w8LmnPdpevVkq351yd/09FoLH8B4/lWPgwnFJwOt6rGddStnSryPHa+cAf+kx9VzjTzBNedzJAJAOFXrTCdN+klGGFAGAcmxC0OgQsP29kb+5TMNZ1muJ9dg5Hqc5n0svO1UAqI1/54VRjxR19fJSFOJASPEnNEBThIDGAEDlQc8mqlKvjX/ahmSDbXPi9eM5QsCqAYDeavD5TIPL8ZEiAJTvSFs/yQCQCpVFpqWeZFcKAKMbuLpu27AxxfXk2qvKtJSepwHgCXqpzy9zhICGABCxTzlfU9TbS0tRiAMojVGKnv8zFck1AgANZeS6bW/MSl9pUdaMSwmwBoBENzVuQkB0AOBmvbT7RgaAVGrvM+tCTyY4AFD5RK3bprLKvT3BDYVZl3IMGwCShXnOo+AAEBlS2c4p6vBlpSjE4hg+zbxQsQdW6mGN//aZ6sCFSxuXPkKWpmHJEhYfH/MFgGyXZyh/ZAB4GqgzjzzJAHBVnCwzLOUkW6pSv/LCqM8yQ/9Php2XCwBl1GX69WBUIigA/Pw4neAmVBkALpHiei69QnqV9do56Il1nECI71qqUt9bst0MSFDs1EAz4sTxQRnAfurZa6WsSx0rrE/gPqpTMQOxwaw9ADxT5+QcoZQB4OrX/huXvVnZ+Df+psdJtlSlvrOkG5al0W5sAPZCB//eIwgQLpa5vHHG0w2E8NZz7EsjbWxT/j10vxAAZll8X4UBYDqckI2P6EU+kmQAiG9YACr/ltGbyEcM2e8tL7lq1SvIsM1PbVg4F8fesd++b1ifZQOA7wowAEyHHkPgAc/v9TnJ4gMAjdj2bWhUuFyb3W8Y23/z6WWV6LuzWddevxPRmPGbS8ynwT4PuJRHmD81aPB3/H3EKAD7sfc7Cyj/9jhju00x3fZhpSjEojgpAm964YSbLgDsjHRQobA9et/IRtAY+ZgXlWvEo3+sx6XhdMoAUBvIwBEafjNyaJ6/j9g3/G2vIM02eml9nA8gqxSFWFTgHb0AleNUAeDEdaXRjuyZsy2iAgDbMfJxQxA6pgwA/HaHABi1regERIccQmHDthxyDHKMp3kHggwAEahooie+4KSOStn8fWvPIXLYtw7Fpusls27Bw6IEnOkmZ2F9Qx+Zaw+flDl6hIbG8py6YopLG6WsKer05aQoxKI46KkA6sx32DkJ+NvDBAAq4qDRjbp+KYdiUR/XIxTxWRqdhsp39AjHtFNpcz4GPslDuaPDDsdOQ10x7Hzi2DYAZJOiEAdExbJ5Thu1cjpEAGBotKFXFHG9nH2TosIqjQhlYaSAbY7asBwmAGwCUcs+iX6S51r7h2N9dADgN9IGahkADmmWANAw8VBkZbxshTVTAOh0sykNVsM03uHHwOgbDylf6yjDlIFaBoBlzRIAymenuHFt1QprlgBAOTtNdR098kB4iH6KaPvbqeqK1c+naaUohNDrPfJTBAAq9sDGgBEHK6zP6CGmDwA7b9EMeVpiZ0l7Pw+fHfj9BCrPpxWkKIROvWeAipuKhYT/pRsLDQAH77HUewZYZ9AAPnNjYfoAQGjrNttf/LwaNJLXXP+RAYDj6zDn09JSFEI/q3ho6GsjX5ds89cbAHYqrJhQWBv5U3rL0wSA7rP9xV9+4PPXvPeB42NUAODzy51Ph5SiEKLC23m7nwHAAPDppTrcC/Fib372ABAy298+tvPUAaD8vgFABoCsSmVOJZXmLWkGgLwVVhkRSvXylqzv0Hhyl3rqBtgAYAAwABwQPRwa/myLASBfhcU6M7SfbVlttr+MAaDxMgjb0gAgA0Am5aRO0+M3AOStsOpLkLIug0bEODfSvDmOkH7FAMDnW89nA4AMAFlkf3++ASBHhUXvlSHszMtKs/290EAaAAwAa0tRiAPI3JszAOSpsErjn3aEaLOkDMc/zPZnADAAyACQx6Dr/fSYODEIF5zs4HqxAWDSALBz93tLw0h5wHYAx0yaAEDo6TTbX5pZNQ0ABoAppCjEwqiUOjb4XN+kwkwxvacBoGuFxf7t1eDTwHPsESpSTwXccba/dMHdAGAASC9FIRbVqUdH5cbQ5lLvAjAADBkC53HBqd4FQCPbaba/dJclDAAGgPRSFGJR9MIaK3R6cUu+DMgA8BnhrkNIpBGc6mVAlKHTbH8pb9rtEAB8DNAAYACYEZV6Y+PPUP+ybwM0AHQLinx+urcBZpntz5kADQCHlqIQC+LkbUzvS78O2ADQpSGsw9/TBYAss/0N7oEbAAwAuaUoxIKomBsqdb7DAHCAAND4Wt56zX+qAFDKnGa2v4FPJ3DMtQaAtG8DNAAsIkUhFsPwf2PPwQBwkADA8H1jUJwqAHSa7a/uz9H6XJqJHyXh2DAAyAAQbtvDie/ZOA/AZAGA/dXcwMRf324JqKlm+xv2aOa2nPHbivBgAJABYMbr/w03VjkT4GQBoMv+in/87ppTYW8nvgJhhmMDnANp5gJgpONKow9sEwOADAAnSjWDWMOkQwaAiQIA69Pl+n/8vPtR19Nbtj+NN9uIyw7XGs2rvx29vfi8AUAGgCMFAHpGjc+SGwAOEABolAJvwKNX3hA4us6iybo3jKqF7SPK2jryYACQAeAoAaDDc9VcjzYATBQAWKcrDcXTsE37Fkz2DaNlAaMlhOroGwDpCBgAZACYNQDQuwqu1LcNswFgkgBARd8YFCMq5LRvNyTwsg8G3zDJqEPkCA3rZACQAWDWAECFE/xo1bbHYgCYJACwzwNuamsKqqxj9oUgNbBB3h57qR4NNQDIANAfjWi/l5vEX1+l0jYATBAA6lB84w1tQ9eR35xhIcwMapTr90fc/Mf2NgDIADDzY4C1V9LU+LcHEANA8scAd94ZEdEQM1o11fX/neNjVFjjPN07p9iP7M+WY4HfMADIADDzRECbEPDS+9xpqEcOixoAkk8EtKn42TZfCon7w/7tAWT5AAD26aB7Dqgz2JY9wpgBQAaAmacCflrBbic+oTKnIglYuFPaAJB4KuBnepmsJ7B3Karn7x4iABB0Om0vzuO6j2rD3+MJHgOADAAvmGIK0SxLqVQMAIMrLELWCkvpwS4fAEDDnXEp54YBQAaALBiOW2ExABz3Mbkzt+8hAgCXVAjGmZYSSiibAUAGgCxKRTF9xV56dQaAyyusaSfKufAGt6nXrZQz7bTGJ1x+MQDIAJDNlSo/KoWWO4r5HI2/NwG2VVhThEX2Mz3IhvWk/CPPAXrc/M6XjHi98BSPN/4QvAwAMgBktbkXILpS4DLEpXd1Ow9Avwor7b0ANGI7w9qRT4pw7LHd+Az7+twZ9Dhu2Y58nu+55PiYJgRsznMDgAwAWTXN0tfeG+Mu43NHDpwJsH+FleoGszrC0zCsTbjscYwQPFjvejz0xvfWJ2dOOT6mCAGbxt8AIANAdnU4fvCNQC2TBdVKxZcBXbfColc9+skOjsedxmz4i4BYz3oMROH3+N2exwf43qiQv50bxAAgA8AsOGk5iMNfaLIfQKhUou9xoEwGAOxMCtM5JHIcXhpA6uWhS0fA+F/2A//t2uci5diWizK1fiejbSODG5c30ryzxACwiBSFOBAqd07mDhXCuXcu85nnGoXoRx2pcKMnWLq0t8k2GzOT4v669hoNoGFi/7dciqiXhy5dl3pNP8U5uGm0e5eL7+sZ9Gto2gtukaNNHE/RoYOypjhmlpOiEAdEEDhzFjAaI06ES3sC9XLA0+vALeoNV6faaYx2se58zzla1pOyUuZzfq/nMC2NEw0y++3cHhMBjc+3Xtuu95akOG9mUS83cJ5d2MiyD0Zud76bMkYe2xyPl/ymx58BYF00MlQYNKZP0ODxbz1PgHQ9MZ3VY6VheHqc0NjzbzVceawkwj5h/xDkXgjG9Xy3sZMBQJIkGQAkHQAjDvVZ/nrp5YT7MPg78DlGSBy5kAwAkjJjuJsGn+u8Txr6XjfKOqQuGQAkfc/eneW4jUNRAN3/rpMLmIBQsCVroh/FI+B8dCeVom3BvBzEV0XbJNfhShAQAkAA4MtRWTYthS9Orn765RelsnMvl3j9UEqJRlBK1l4XzyH78uSKnfDrz4AXqvYH0yjRCErJF/WHk8hKtI+xXFgV00lyIABw8/rs2hdp/rxEO6lvu76AAAACAKVs1A/IF6pHrTg6+l/W+H938NUnWY46Uu43h/CUeD+glBKNoKQWAjbO6BYE2Dq9sMl/X13Uxx4AEADYcLZ+gCBASf87d08BgADAnUVDFpc9ApTxRZlo9yQIAHTazZ0g4KkButm4nGcBAgAnpVPfW8I4O8F9AXNn/YCte7BEO6GcEo1gKPnC3XmaW0JDdmLbJ8A391fW7HMgVe6ZbEY9swSQf6fE64JySjSC4bR9AQefyc6sQInXQR3pyNNZ71zDz71kAyAIAFRfEjArwJvRfqbpD4/icw+tXO4vEAC48Uv87DnvWVKwV2AiCY5/RvtHA0DuHev/IAAwylMCG1/2wsADtRLAB2aM8rOflqKcAAgCAFVOD3yNyIQBcj+kE85I/Ogy0drjpPkz0/8gAFDJDRXgWhjwpV5cOuXW6Z9cFtr6rDOjsPbzJd4PKKtEI3ikG2vA58s9ISO/o8RrnVlmZxLMEtAyYu9Yv3/t93nSBAQAfiy7vM91DNvTxGYH+q/nZ5SfIHZ1sEuo+zZgrt0Tlo1AAKDKKDHTtR2uTD3ndwkE13b4rQzvXSFu7/P6CSCq/4EAwChWlgXuniFIp5COzMhwXUJTW8fv8VnlszkS1BL0jP5BAGA06WBObRI7P9WcWYLpQ0Hr7Nvovi3VdPoM8t4fvX+M/kEAYGSZpu8WBLZnCtIJZuTbgsFjlhAy89Km8RN8OozstwpEnXk9eQ0O/gEBgNFl9J2OKR1w1SsdSzrN16xBOrB0qGXqzLe2pF2LTr5MuFqs819xv+TfUvcfBACeYoQg8EWho1iGhaVleFjz7ufamnwzzPuUdqb9+XwvmjVy6h8IADxVpaUB10+m+vec/Z//N+0+DhAAeKR0IBntusa5biz3nD0Z72YYHAgFAgBP1QrJuOpe+Xxu7ogzzW/dHwQAZvR/mjcbySwPFLnyOeTz6DT9ntG+435BAGB2r1mBYTbDPeXK+91G+50/779VAkvchzCsEo2Ak1oxGtetnf6vO932NMRjzmcAAQCuWyIQBh7W6QMCAOyVziudmD0D3x/PmxG2jXUwgxKNgD7H4WbDWmYH7BtQOREo0Qj4bSCYZobgNcLX4QMCALypjFfuHP0TFQ8TckzpAwIA7NxU2IrstGBQ6mTCLGUs6g4kwDgVDxAAoFMVvoyy0wFHlhRaUDgyk5C//6moUCskpJMHBAAAQAAAAAQAAEAAAAAEAACYVolGAAACAAAgAAAAAgAAIAAAAAIAACAAAAACAAAgAADArEo0AgAQAAAAAQAAEAAAAAEAABAAAAABAAAQAAAAAQAAZlWiEQCAAAAACAAAgAAAAAgAAIAAAAAIAACAAAAACAAAMKsSjQAABAAAQAAAAAQAAEAAAAAEAABAAAAABAAAQAAAgFmVaAQAIAAAAAIAACAAAAACAAAgAAAAAgAAIAAAAAIAAMyqRCMAAAEAABAAAAABAAAQAAAAAQAAEAAAAAEAABAAAGBWJRoBAAgAAIAAAAAIAACAAAAACAAAgAAAAAgAAIAAAACz+sfeHaRIUkRhAL6CR/AIHsEjeASP4BG8gXs3unMlLty50ZU7caEggjAIoiDCwCCIIrTxNAfame7pnq6omj/ifQkfwthTk5WZ8eKPyMjsiJ0AAAQAAEAAAAAEAABAAAAABAAAQAAAAAQAAEAAAICuInYCABAAAAABAAAQAAAAAYCtvfvVryd589NHEd8DIE7ETsAtTtwqBER8D4A4ETsBAgCAAAACAIAAQGMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAQEMCAIAAwAu88fEPV29++ujqrc9+rE7vXurny2sffhfxHQSA/7n3+Xz7i5/+/dnXP/o+Yr9Zy661AwFgO1XknzbUz3/+/erRk7+uZm31ee9981t9fkzD7hIA6rxWR/7B949POqeP//y7zuPTIh3x3chwXGOza0ddc5G1AwFgeffvGOZvX//2x9U7X/5SDVoAOIM6rnV86zifaaviXNfOJcJA/Rt1vE9VnUjE+XmJNjrje9fnnKV2fPLoSV0HxxXRp3YgACypGu7TjiFlOzoRAWDO+a3jeemiXAGyOoRzBppZ32mp2Ysa/U7oMOv4qR0IAB2Nxl/FOarh3nKboO4ZCgAPPMdVDF/xVkHgXKPsKvSz9nGJ0WNdXxO2alNqBwJAN9dHgytt435fFR4B4H5qVBZ3jqsgn2HhYF0bs66xiHP3osVzE7a6NtQOBIBORuONGA2eOG1ZRVAAuOM8V0ebulXnMfm2QBX3uja2vhUw6TvW/Xm1AwGgix0a7zMdSE0nCwDPq+OyzOhsXJORo+Nx/CJHizWKnfTd1I6Qc9pSxE40UA29isau2xhFCgDX1PFYbTsWok297VHbhFFyRBu+FuxmzW6oHf/Vjojz2lLETjSwYofwgIYsALz/7dKjtCMERK2QH1vMSHHSkw7Voasdgee3nYidaKJWNu+8jcJYU7+tA8DKnf/sEHBMW8/oMOszIt50OOmRP7Xj+fNrTYAAsLcOSf54fKtlAKgp71220dHFTZnfsk9Lnd8jyKgdNwejyPUeW4vYiUZ2T/LH9Ga7ALBjgZ54Hus+/qUfmZu9qHHGTEZdJ2rHwo9+bidiJxo5Z0dxvJP7NpdckV4Fs00AODqHc46MqgOt73Jd/Vn9vyXuzY6RXXVgy94KmPTIn9px9+ZWgACwtyqEpzbWo0OoAl0N5mUKca0+rqRd+xE/hZweAI6O7RyP5d33F6vUz9TP3jTKjupw67qbFIiWe+TvuDUWVTvG+di6diAARKpi/YCiV412djquBn3TwrWYl7ikB4DJj2fV/lahjXrPxOgw4l6de8N5jX61cbXbSTOIUbVjXBuxtQMBIFal3HuMGqqDqaJ+iUJXhSLu5TLJHcU4ZrGv5R37VqO9uFsBx3R6VKd6x+xO3DV4j32qn6l/91K1o/69uNqBABCrGs0LOoNK+lv8sprxmdsGgFH0ohc+TXwlb33XuDUTt6waj1q4WG35DDOIagcCwOqqsT7TeCOmvkZDjnk5UGoAGJ8bcXzuGQLi9nWs5o8OT+O7Rq2fUDsQADZTDfYYXUU03mcKTMT948QAcLwNbpkCd4SAqFmA4xqLvF98vLwo6rbJLbWjzqvagQCwqtRXYE7q5GrbLgCMz1zuHueYdo8LLcc1FrPC/loHFjsz0al2jM+I+D5bi9gJIlWxnzRC2yYAHMVtqcfYrk27xz2CNzqxqEVj43qJX5uwgnGtRc7uIABw2YVuVQy2CQAjFMWvXr9jBX7c/o/RcsSTCuN7LfF0wipG7Vj2zY9tROwEsSZNd28TAEYHGj81fMe945jR9hneElif9dB90GEF1g6vBhYAeHVqQdSMR6G2CAA1sjuxg4qYGh7nI+7ebB3bV7hwrEKNRWub1Q4EAAKm8sbf3yIAjNHIFqOZcRsjcoX7MWK8+Cj8WIewRbhLM9p+1JMnCABcfnS0RQA4sZhF/D77Q3VYkWGmbrFc8vn7Y1GnxWrBL1NK+S5bitgJoo1OtH0AGFPUUavnJ8xmRI7MJj2DX1PHWz3yt6rR/gSAZBE7QbQJU6Q10lo6AIwiv9XisOOcRs5o1LGadCtguccidzNuNwkAySJ2gmgTVo7XZywdAEahj+wsTxD1UqA7po5nP5JXfx79qt9djHbvscpkETtBtO4BYMxeRE6XT3gaIHbq+7g3f64Rev15dADaxWj31lcki9gJonUPAGPft3w8bByb6Ee0juM++xqo4OKRvwa1AwGAxRtxQACoz4i4DdHx/uzRWc+6/uq/cb97YGcCQLiInSBa9wAwRntbFrAV7s/O/E2GxxMG8d95JwJAuIidIFr3ADA6j20L2ArFedJbAqvzj7ieOhEAwkXsBK9SFdhqZDepaeJ6EVDrAHDiFj1dvEqHOOF5cq+lbVY7EAC2V51LNZB6rruKZKlGV8XquhO3tgFgFLj4++QdAsCJTy145K9h7UAA2MooQJWqa2FURMPsEABqvyfsQ6xxe2OZUfED7+FH/KrhgJF6u9qBALC8f9i7oyvHbSwIoClsaA7JmTkUp7IoH9ru6fF0t1qUVA+8POf+rHdmIIl4KIIgmMKTVJ5CPfmYGgCyW5yjIwB8cwfDy271e/XagQAwUtJ6Om6udnY5pgaA/HlH11a4x1MZz/p81Ws41A4EgE2sE33c9JwA4HjBveuvXtVe5pE/tQMBYKidO+/0AJCrTUdXALhhbcZWL3BSOxAANpIrmdxfvMIxNQDsXlynBoD4oO9sv9Wv2oEAMNiaWhy/OEcAcNwRACre0viLR/6q7/urHQgAg63HcbZapCMAXPt48WCYvlRxrk55f8O0o/n3GK+iERdyxQ4sAOx9nNAvah7VbJ76VzsQAAa7agcWAPY+pr/WeMKOf2pHx++wnYpGXEA25Wg5ct80A9s7ufpJMX3v0u8CEAC6A8A6r7bY20DtEAAEgE09aQvTdMSsDE7HS6eJLGaqKLICwL7H8V1ttR9Ay1v/1A4BQAAY7kGDSIpfOm06SP1V1tQAkO/3hOK6teO72m5HwLXAUO0YXDsQALa8d7em1dIpRk2zTg0A68+PvULe2RPuiWeQzFXwVp/xSrUDASC2maJc999yVTLyPuuVA0DzM+UT/fjo354vAlrnTD6j2iEACABTJcGfmNxHL7SaGgDWb6iAlfl585/9XgW8Hm1UO/QfAWCydfU/vgNfPQAoYF2+sCZji50B1Q79RwAYbJ20I9+33taJXxwAsgp7mxXl033zcbhx/XB9znFtbqwdCACjr1RaNiW5cgBYxl+F7eBL98Q3eTvgOl/UDgFAAJhsTeFVDF7TO3HBd5h7zlttLDNRwX4MGVSzkE7tGFI7EABe4pg23mb1+NUDwLoi8yjg8K1+V4DIwFq/S+CqHSPXLDTWDgSAsfcqm15KcvUAsKZ+R64k30GuuE8aEHMO1u8SuM6TrW45CQDlKhqxmROuWPL4WcVnEQD+GoTGPk8+2bGPxpnhK+dD9Qtq1A4BQAAYbhX7LbYhFQD+ce8CtAxkFb/lJJkFe8DVcKbxa3cJXO1VOwQAAWCydb9xq3vGAsBfg5HbAMM20ToG6V/tJFg51a52CAACwHA68X4BYK0D2GpdR7PjDXiPvBLO71m5S6DaIQAIAMPpxPsFgJOe7Kh4Nrtdpuif8Lunn9Y9b692CAACwHA68X4B4BiYKqeNd3LC+pn8TrdsLlS1457aIQAIAMOtTrzNHgACwA/TxtUryKfL9/LkK/JM4VftEqh26C8CwHCrE2910gsA/14xrqN+M5mJjqvxlzwCd6y8r1h9r3Z0f57tVDRiM6ugVA1ckztx2/e4ftv6zWQmysD3okWWCR81uwSuz1AzGzG9diAAjN0IqOkqcQ16AsBhXeWNfs98owxYJ+3299KB6tjwSe0oqR0IAGOfYW5ZMX50YAHgx6vVUS+XabY+f826ihN3Cbx87VhhLLWj5rdFABhX1NKBXtmBj1XvAsDPV4vj3jDX6Jh6r9pmOef8C2cjcm6pHQKAADDdOmoWFn0nwByFeXwAWFfrtfesrx4C1iBVN9190i6BuZevdggA/SoasaEUgJNWjCdRP/V+7FEAKzrxCYNr9SzPm3ZWvcTlkDaloGdKufI22fodKtckHE8kqB0CQLeKRmzoKHBjpvNS4N9c1dZ04nXUvh0tU88nHyn+Fc9xHwP/23OwbqvfNeBUP5XwzV0C87nUDgFAAJhsFfERA0P+ztwnPwpyXSdunmL/4B72ve29YXA7/Vz41WfKf6+5z74GnBH7EqSd3xhQ1Q4BQACYLh3vxCOFOZ1hVOe985G3FNAzp9jzuf+r4Oa/5Wop7bxn0dbZv3eCQNr8yIEun/0r52rOl4pZkzsf+Xv2LoH53tQOAaBTRSM29aDBIYNiitN3i9qti6/OKoJnBICz7o3m740UsbunTPPZHn2kXUeAOWP9QoJFBpmRz9qvc3jUQsVjrYLaUfQkDwLAmB3OPijI6ZAp5ikY8baARAaNdKAP2tHdiT8dXM//Titmez4LMPnd893kNz68vUJ7+7/n/5cr75wDr1pPkTbVvoP/SbsE5u9SOwSALhWN2Fg6kuPoxI+fhj35au32Z593PzIYvigg5d/O9zy2D68QpnYIAF0qGrG5dPyrH6sTVyym/OLq8ooNUFqPG2cB8n3WPvL35JmoBNqbb0Fc/RAABIDR/p5GnHxkYHvR1O2zB9VcrdbsgtZ45PPdsN5gm0HgxF0CL1U71i2Emp0eEQC+qnKHsRccGbzvncZNEajYU+GLRbpqK9TGI9PTX/we6nb7m7ZLYP7dqcdRO9L/ax/5vLSKRlxEBrJpR6683kzlvqoT/3wVVLgO4P3gl8+865HP9oTp6wy4FS/FOvl2Rv4etUMAEACuZkpHTuHN/cqTNijJAF7xTPYNxavq3nHbkavyT36v6l0cJ+4SqHYgAGygvSOnwKXDnnwftG5jpSdddWS6fPx93BveWZBz56yp8or++qBHGtOXLlU77ugDFb/7lioacUGNawLSnlyxPuiJhhSGUffWTx40Rj8Ncpwb+RyVi+Xe2XqXwBUoK2tHpvkfVDuqz4XRKhpxUTmpc5VTcKQdGaAf+Wxy/mzdu8afvAVpvuOa3/wB2xFnQKv97nfZJXBq7VihaevzYaSKRlxcOsaLpogzZXdr50ra/+7Cp1FX0xnMHjgDVP2M9yrqOS9HbJgz/fHeY4MjtePj2lHxm2+nohH8xytYH/54zndTdQaHim1c0/4HvSsgBecZq8/zb+TfqlgjkN/1eN/AqPviO+z0ufqG2lG0BfRlVDSC90UlJ3wKauXAduwvf6sUqUddTeeqMQXwnr310758N69cF/LMvdfzufO95SoyA/gZ58S98h1U9MEbr8LP+Oz5Dc5oyyNrR9q4Ve24vIpG8GmHOd5cd+sUXQp8Os9lFtEcL8JJsfqooKRQ1t9XPH77FPR7QkHOm/z5ty9/ucz5cGUn1I70E+fKzioawa0d+1cU9wvIVXJ+509UbaBDB7UDAQAArq6iEQCAAAAACAAAgAAAAAgAAIAAAAAIAACAAAAACAAAcFUVjQAABAAAQAAAAAQAAEAAAAAEAABAAAAABAAAQAAAgKuqaAQAIAAAAAIAACAAAAACAAAgAAAAAgAAIAAAAAIAAFxVRSMAAAEAABAAAAABAAAQAAAAAQAAEAAAAAEAABAAAOCqKhoBAAgAAIAAAAAIAACAAAAACAAAgAAAAAgAAIAAAABXVdEIAEAAAAAEAABAAAAABAAAQAAAAAQAAEAAAAAEAAC4qopGAAACAAAgAAAAAgAAIAAAAAIAACAAAAACAAAgAADAVVU0AgAQAAAAAQAAEAAAAAEAABAAAAABAAAQAAAAAQAArqqiEQCAAAAACAAAgAAAAAgAAIAAAAAIAACAAAAACAAAcFUVjQAABAAAQAAAAAQAAEAAAAAEAADgawHgz4qGAADP8mcCwB8ljQEAnuOPBIDfSxoDADzH7wkAv5U0BgB4jt8SAP5X0hgA/t/e/dU4CARxAB4JSKiESkECUnCABCQgoRIqoRKwcPPAJQ255np/lm433y/5kpb0YcILk51lC8foIjL5YamkIACgrCU+k1+GSooCAMoa7huALq2VFAYAlLGmLu6TF6ZKigMAyphin7x4qqQ4AKCMU3wRZwIAQLvG2MVeAABo2zb7fxwHAwFAe/p4JvnDuZKCAYC/mePZbKOAayWFAwC/c3209G8/AAC0aTf3/1kTcNYEAMDbWdM5tmgCAKB93z787QkAgLbsZv7/1AR4OwAAqjWnLool3yU0EgCAaqypj0OSHYZjgwHg5cbUxdHZ/kBosiIAAIdZ05RO8epsKwJDWiq5OQDQmiUNqYsqk4WlPo3pkm6V3DgAeBe3dElj6ks89D8AFuHSROvWux4AAAAASUVORK5CYII=';


/**
 * Class for the alexa-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3Alexa {

    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;
        console.log("Constructor");
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'alexa',
            name: 'Alexa',
            blockIconURI: iconURI,
            blocks: [
                {
                    opcode: 'registerUser',
                    blockType: BlockType.COMMAND,
                    text: 'Create account: Username [USERNAME]   Passphrase [PASSPHRASE]',
                    arguments: {
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        PASSPHRASE: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'loginUser',
                    blockType: BlockType.COMMAND,
                    text: 'Access account: Username [USERNAME]   Passphrase [PASSPHRASE]',
                    arguments: {
                        USERNAME: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        PASSPHRASE: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                },
                {
                    opcode: 'addUserAttribute',
                    blockType: BlockType.COMMAND,
                    text: 'Tell Alexa my favourite [ATTRIBUTE] is [VALUE]',
                    arguments: {
                        ATTRIBUTE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'band'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Artic Monkeys'
                        }
                    }
                },
                {
                    opcode: 'addAlexaAttribute',
                    blockType: BlockType.COMMAND,
                    text: 'Tell Alexa it\'s favourite [ATTRIBUTE] is [VALUE]',
                    arguments: {
                        ATTRIBUTE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'movie'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Bladerunner'
                        }
                    }
                },
                {
                  opcode: 'addUserMessage',
                  blockType: BlockType.COMMAND,
                  text: 'Message Alexa: [MESSAGE]',
                  arguments: {
                    MESSAGE: {
                      type: ArgumentType.STRING,
                      defaultValue: ''
                    }
                  }
                },
                {
                  opcode: 'runBlockSet1',
                  blockType: BlockType.HAT,
                  text: 'Block Set 1'
                },
                {
                  opcode: 'runBlockSet2',
                  blockType: BlockType.HAT,
                  text: 'Block Set 2'
                },
                {
                  opcode: 'runBlockSet3',
                  blockType: BlockType.HAT,
                  text: 'Block Set 3'
                },
                {
                  opcode: 'getAccessCode',
                  blockType: BlockType.REPORTER,
                  text: 'Access Code'
                }
            ]
        };
    }

    /**
      * Login to personalize alexa.
      * @param {object} args - the block arguments.
      * @param {object} util - utility object provided by the runtime.
      * @property {string} USERNAME - the number of the drum to play.
      * @property {string} PASSPHRASE - the duration in beats of the drum sound.
      */
    loginUser (args, util) {
        const username = args.USERNAME;
        const passphrase = args.PASSPHRASE;

        request.post(LOGIN_URL, {form: {username: username, passphrase: passphrase}}, (err, httpResponse, body) => {
            if (err == null) {
                let res = JSON.parse(body);
                if (res.authToken != undefined) {
                    console.log(`loginUser: ${res.access_code}`);
                    USER_AUTH_TOKEN = res.authToken;
                    USER_ACCESS_CODE = res.access_code;
                    this.connectSever();
                } else console.log('loginUser: Fail');
            } else {
              console.log(`Error: ${err.message}`);
            }
        });
    }

    /**
      * Register user to personalize alexa.
      * @param {object} args - the block arguments.
      * @param {object} util - utility object provided by the runtime.
      * @property {string} USERNAME - the number of the drum to play.
      * @property {string} PASSPHRASE - the duration in beats of the drum sound.
      */
     registerUser (args, util) {
       const username = args.USERNAME;
       const passphrase = args.PASSPHRASE;

       request.post(REGISTER_URL, {form:{'username': username, 'passphrase': passphrase}}, function(err,httpResponse,body) {
         if(err == null) {
           var res = JSON.parse(body);
           if (res.username != undefined) {
             console.log('registerUser: Ok');
           } else console.log('registerUser: Fail');
         } else {
           console.log(`Error: ${err.message}`);
         }
       });
     }

    /**
      * Teach Alexa what you like
      * @param {object} args - the block arguments.
      * @param {object} util - utility object provided by the runtime.
      * @property {string} ATTRIBUTE - the number of the drum to play.
      * @property {string} VALUE - the duration in beats of the drum sound.
      */
    addUserAttribute (args, util) {
        const attribute = args.ATTRIBUTE;
        const value = args.VALUE;
        const headers = {
          'authtoken' : USER_AUTH_TOKEN,
          'Content-Type' : 'application/x-www-form-urlencoded'
        };
        request.post(USER_ATTRIBUTES_URL, { 'headers': headers, 'form': {attribute: attribute, value: value}}, (err, httpResponse, body) => {
            if (err == null) {
                const res = JSON.parse(body);
                if (res.value != null) {
                    console.log('addUserAttribute: Ok');
                } else console.console.log('addUserAttribute: Fail');
            } else {
              console.log(`Error: ${err.message}`);
            }
        });
    }

    /**
      * Add a message to play on Alexa
      * @param {object} args - the block arguments.
      * @param {object} util - utility object provided by the runtime.
      * @property {string} ATTRIBUTE - the number of the drum to play.
      * @property {string} VALUE - the duration in beats of the drum sound.
      */
    addUserMessage (args, util) {
        const message = args.MESSAGE;
        const headers = {
          'authtoken' : USER_AUTH_TOKEN,
          'Content-Type' : 'application/x-www-form-urlencoded'
        };
        request.post(USER_MESSAGES_URL, { 'headers': headers, 'form': {'message': message}}, (err, httpResponse, body) => {
            if (err == null) {
                const res = JSON.parse(body);
                if (res.value != null) {
                    console.log('addUserMessage: Ok');
                } else console.console.log('addUserMessage: Fail');
            } else {
              console.log(`Error: ${err.message}`);
            }
        });
    }

    /**
      * Teach Alexa what it likes
      * @param {object} args - the block arguments.
      * @param {object} util - utility object provided by the runtime.
      * @property {string} ATTRIBUTE - the number of the drum to play.
      * @property {string} VALUE - the duration in beats of the drum sound.
      */
    addAlexaAttribute (args, util) {
        const attribute = args.ATTRIBUTE;
        const value = args.VALUE;
        console.log(`Adding alexa attribute ${attribute} with value ${value}`);
        request.post(ALEXA_ATTRIBUTES_URL, {form: {attribute: attribute, value: value}}, (err, httpResponse, body) => {
            if (err == null) {
                const res = JSON.parse(body);
                if (res.value != null) {
                    console.log('addAlexaAttribute: Ok');
                } else console.console.log('addUserAttribute: Fail');
            } else {
              console.log(`Error: ${err.message}`);
            }
        });
    }

    /**
      * Run blocks in the hat block
    */
    runBlockSet1() {
      if(blockSet1Execute) {
        blockSet1Execute = false;
        return true;
      }
      return false;
    }

    /**
      * Run blocks in the hat block
    */
    runBlockSet2() {
      if(blockSet2Execute) {
        blockSet2Execute = false;
        return true;
      }
      return false;
    }

    /**
      * Run blocks in the hat block
    */
    runBlockSet3() {
      if(blockSet3Execute) {
        blockSet3Execute = false;
        return true;
      }
      return false;
    }

    getAccessCode() {
      return USER_ACCESS_CODE;
    }


    connectSever() {
      socket = SocketIO(BASE_URL);
      socket.on('connect', function () {
        socket.send({ command:'register', access_code: USER_ACCESS_CODE });
        console.log('Connected');
      });

      socket.on('message', function (message) {
        console.log(message);
        if(message.error != null) {
          console.log(message.error);
          return;
        }
        if(message.command == "runBlockSet") {
          if(message.arguments.set == 1) {
            blockSet1Execute = true;
          }
          if(message.arguments.set == 2) {
            blockSet2Execute = true;
          }
          if(message.arguments.set == 3) {
            blockSet3Execute = true;
          }
        }
      });
    }
}

module.exports = Scratch3Alexa;
