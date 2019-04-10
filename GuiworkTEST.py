from Tkinter import *	# either tkinter (3.X+ python version)
from random import *

def jump():
	b.place(relx=random(), rely=random())
	
master = Tk()

b = Button(master, text = "derp", command=jump)
b.place(relx=0.5, rely = 0.5, anchor=CENTER)

mainloop()