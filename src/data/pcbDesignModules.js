export const PCB_DESIGN_PROJECTS = [
  {
    id: 'pcb_proj_1',
    title: 'LED Blinking Circuit PCB',
    difficulty: 'Beginner',
    tech: 'KiCad / 555 / Transistor Astable',
    description: 'Design a fundamental LED flasher circuit PCB in KiCad. Includes schematic capture, footprint assignment, 2-layer trace routing, and photorealistic 3D render view.',
    requirements: 'Original KiCad schematic (.kicad_sch), PCB layout (.kicad_pcb), and 3D raytracing render screenshot.',
    github: 'https://github.com/pdnataraj/Getting-to-Blinky',
    tutorial: 'https://docs.twisted.hackclub.com/Hardware/Starter%20Projects/blinky/'
  },
  {
    id: 'pcb_proj_2',
    title: '5V Regulated Power Supply PCB',
    difficulty: 'Beginner–Intermediate',
    tech: 'LM7805 / THT / Filter Capacitors',
    description: 'Design a reliable 5V DC regulated power supply module using LM7805, input/output decoupling capacitors, reverse polarity diode protection, status LED, and screw terminals.',
    requirements: 'KiCad schematic, PCB layout, LM7805 regulator datasheet analysis, and Bill of Materials (BOM CSV).',
    github: 'https://github.com/niyathiarun/Basic-PCB-Projects',
    tutorial: 'https://www.youtube.com/watch?v=M-mTjvak1LY'
  },
  {
    id: 'pcb_proj_3',
    title: '555 Timer Circuit PCB (Astable Multivibrator)',
    difficulty: 'Beginner',
    tech: 'NE555 / Astable Oscillation / 2-Layer',
    description: 'Design a dual-layer oscillator PCB powered by the classic NE555 timer IC in astable mode, driving alternating LEDs with frequency tuning potentiometer and copper ground planes.',
    requirements: 'Astable 555 schematic (.kicad_sch), 2-layer PCB layout (.kicad_pcb), and fabrication Gerber ZIP bundle.',
    github: 'https://github.com/KapHeir/ne555-led-flasher',
    repo2: 'https://github.com/sitlesh/555-Timer-PCB-Design'
  },
  {
    id: 'pcb_proj_4',
    title: 'Automatic Night Lamp PCB (LDR Dark Sensor)',
    difficulty: 'Beginner',
    tech: 'LDR Sensor / BC547 / Switching Circuit',
    description: 'Design an automated twilight/night lamp switch PCB using a Light Dependent Resistor (LDR), BC547 NPN transistor switch, sensitivity trimmer, and high-efficiency LED array.',
    requirements: 'LDR schematic, PCB layout, 3D screenshot, and a concise technical explanation of the dark-activated switching operation.',
    github: 'https://github.com/majzoub-alsiddig/automatic-night-light',
    tutorial: 'https://www.youtube.com/watch?v=dt0KDcHqgbA'
  }
];

export const PCB_DESIGN_MODULES = [
  {
    id: 'pcb_mod_1',
    week_number: 1,
    title: 'Week 1 · PCB Basics, KiCad Setup & Schematic Capture',
    task_details: `Goal: Install KiCad, learn electronics schematic fundamentals, place components from official libraries, wire a complete electronic circuit, and run Electrical Rules Check (ERC).

Task 1 – KiCad Installation & Workspace Configuration:
• Download and install KiCad 8 (or latest stable) from kicad.org.
• Explore the KiCad Project Manager and create a new project (e.g., 'DAKH_PCB_Blinky').
• Configure standard KiCad symbol libraries and footprint libraries.

Task 2 – Schematic Capture in KiCad Schematic Editor:
• Open the Schematic Editor (.kicad_sch).
• Place essential schematic symbols using the 'Add Symbol' (A) shortcut: Resistors (R), Capacitors (C), LEDs, Transistors (BC547), and Power Rails (VCC, GND).
• Understand Reference Designators (R1, C1, D1, Q1) and annotate schematic symbols.
• Wire component pins cleanly and use Net Labels for clear, readable bus connections.
• Add 'PWR_FLAG' symbols to your power and ground nets so KiCad knows power is supplied.

Task 3 – Electrical Rules Check (ERC):
• Run Electrical Rules Check (ERC) from the top toolbar.
• Resolve any warnings or errors (unconnected pins, missing power flags, or duplicate designators).
• Export a clean PDF copy of your completed schematic.

Submission Requirements:
1. Original KiCad schematic file (.kicad_sch)
2. Exported schematic PDF or clear screenshot
3. ERC verification report showing 0 errors`,
    videos: [
      {
        title: 'KiCad Full Tutorial – Schematic to PCB for Beginners',
        url: 'https://www.youtube.com/watch?v=dfyv_S26Oa0',
        duration: '42:15'
      },
      {
        title: 'KiCad Schematic Capture & Symbol Placement Step-by-Step',
        url: 'https://www.youtube.com/watch?v=g3vxpdG1chs',
        duration: '28:40'
      }
    ],
    resources: [
      {
        title: 'Official KiCad Getting Started Documentation',
        url: 'https://docs.kicad.org/10.0/en/getting_started_in_kicad/getting_started_in_kicad.html'
      },
      {
        title: 'Getting to Blinky PCB Repository (GitHub)',
        url: 'https://github.com/pdnataraj/Getting-to-Blinky'
      },
      {
        title: 'Step-by-step Blinky PCB Starter Tutorial',
        url: 'https://docs.twisted.hackclub.com/Hardware/Starter%20Projects/blinky/'
      }
    ],
    quiz_data: [
      {
        question: 'What is the primary purpose of an electronic schematic diagram in PCB design?',
        options: [
          'To determine the physical 3D dimensions of the enclosure',
          'To define logical electrical connections and components of the circuit before physical layout',
          'To generate drill holes for CNC machines directly',
          'To calculate shipping costs of the PCB'
        ],
        correct_option: 1,
        answer: 'To define logical electrical connections and components of the circuit before physical layout'
      },
      {
        question: 'Why does KiCad require a "PWR_FLAG" symbol on power nets (like VCC and GND)?',
        options: [
          'To increase the voltage of the battery',
          'To inform the Electrical Rules Checker (ERC) that power is actively provided to the net',
          'To change the copper color from green to purple',
          'To automatically solder components on the board'
        ],
        correct_option: 1,
        answer: 'To inform the Electrical Rules Checker (ERC) that power is actively provided to the net'
      },
      {
        question: 'Which tool in KiCad validates that all pins are connected properly and there are no short circuits in the schematic?',
        options: [
          'Design Rules Check (DRC)',
          'Electrical Rules Check (ERC)',
          'Gerber Viewer',
          'Calculatix'
        ],
        correct_option: 1,
        answer: 'Electrical Rules Check (ERC)'
      },
      {
        question: 'In standard electronics schematics, what does the reference designator "U" typically denote?',
        options: [
          'User Switch',
          'Integrated Circuit (IC)',
          'Ultrasonic Sensor only',
          'Universal Connector'
        ],
        correct_option: 1,
        answer: 'Integrated Circuit (IC)'
      },
      {
        question: 'What happens if two pins in KiCad are assigned the exact same Net Label name?',
        options: [
          'KiCad reports a fatal compilation crash',
          'They are automatically connected together electrically without needing a physical crossing wire',
          'They disconnect each other',
          'The schematic reverses polarity'
        ],
        correct_option: 1,
        answer: 'They are automatically connected together electrically without needing a physical crossing wire'
      }
    ]
  },
  {
    id: 'pcb_mod_2',
    week_number: 2,
    title: 'Week 2 · Footprint Assignment, 3D Models & Power Supply Circuit',
    task_details: `Goal: Master the difference between schematic symbols and physical footprints, assign correct THT and SMD footprints to components, associate 3D models, and design a 5V regulated power supply circuit.

Task 1 – Footprint Association in KiCad:
• Open the 'Assign Footprints' tool (Tools -> Assign Footprints).
• Differentiate between Through-Hole Technology (THT) (e.g. Resistor_THT:R_Axial_DIN0207, LED_THT:LED_D5.0mm) and Surface Mount (SMD) packages (0805, 1206, SOIC-8).
• Verify pin-to-pad mapping (e.g., Anode vs Cathode on LEDs, Collector-Base-Emitter on transistors, Pin 1 on ICs).

Task 2 – 3D Model Verification:
• In Footprint Properties, inspect the 3D Models tab.
• Ensure every assigned footprint has an accurate 3D model (.step or .wrl) aligned to the footprint pads.

Task 3 – 5V Regulated Power Supply Design (LM7805):
• Build the schematic for an LM7805 linear regulator circuit:
  - Input: 9V-12V DC input via DC barrel jack or 2-pin screw terminal.
  - Filtering: 100uF electrolytic capacitor on input, 10uF on output, and 100nF ceramic decoupling capacitors.
  - Protection: 1N4007 reverse-polarity protection diode across input.
  - Indicator: 5V power indicator LED with 1k resistor.
• Run ERC and confirm 0 errors.

Submission Requirements:
1. KiCad schematic with assigned footprints (.kicad_sch)
2. LM7805 regulator circuit schematic PDF
3. Footprint mapping table with package dimensions`,
    videos: [
      {
        title: 'KiCad Complete Beginner Tutorial – Footprints & 3D Models',
        url: 'https://www.youtube.com/watch?v=g3vxpdG1chs',
        duration: '35:20'
      },
      {
        title: '7805 Regulator PCB KiCad Video: Schematic to 3D Board',
        url: 'https://www.youtube.com/watch?v=M-mTjvak1LY',
        duration: '22:15'
      }
    ],
    resources: [
      {
        title: 'Basic PCB Projects Repository with 7805 Reference (GitHub)',
        url: 'https://github.com/niyathiarun/Basic-PCB-Projects'
      },
      {
        title: 'LM7805 Voltage Regulator Datasheet & Typical Application Circuit',
        url: 'https://www.ti.com/lit/ds/symlink/lm340.pdf'
      }
    ],
    quiz_data: [
      {
        question: 'What is the fundamental difference between a Schematic Symbol and a Footprint?',
        options: [
          'A symbol represents logical function on the schematic, whereas a footprint defines physical pads, drill holes, and dimensions on the PCB board',
          'A symbol is for 3D printing and footprint is for soldering',
          'Footprints only exist in digital simulations',
          'There is no difference, both are identical'
        ],
        correct_option: 0,
        answer: 'A symbol represents logical function on the schematic, whereas a footprint defines physical pads, drill holes, and dimensions on the PCB board'
      },
      {
        question: 'What is the standard pin pitch for standard Through-Hole (THT) breadboards and DIP ICs?',
        options: [
          '1.00 mm',
          '2.54 mm (0.1 inch / 100 mil)',
          '5.08 mm',
          '0.50 mm'
        ],
        correct_option: 1,
        answer: '2.54 mm (0.1 inch / 100 mil)'
      },
      {
        question: 'Why are small ceramic decoupling capacitors (e.g. 100nF) placed close to the VCC and GND pins of an IC?',
        options: [
          'To increase the brightness of the room',
          'To filter high-frequency noise and provide instant localized current during switching transients',
          'To act as a fuse during lightning strikes',
          'To measure the temperature of the board'
        ],
        correct_option: 1,
        answer: 'To filter high-frequency noise and provide instant localized current during switching transients'
      },
      {
        question: 'In an LM7805 linear regulator in a TO-220 package, what are the three pins in order (1, 2, 3)?',
        options: [
          'Output, Ground, Input',
          'Input, Ground, Output',
          'Ground, Input, Output',
          'Base, Collector, Emitter'
        ],
        correct_option: 1,
        answer: 'Input, Ground, Output'
      },
      {
        question: 'Which lead of a standard through-hole LED is usually the longer lead?',
        options: [
          'Anode (positive terminal)',
          'Cathode (negative terminal)',
          'Ground terminal',
          'Neither, both are identical length'
        ],
        correct_option: 0,
        answer: 'Anode (positive terminal)'
      }
    ]
  },
  {
    id: 'pcb_mod_3',
    week_number: 3,
    title: 'Week 3 · 2-Layer PCB Layout, Trace Routing & Design Rules Check (DRC)',
    task_details: `Goal: Transition from schematic to physical board layout, define the board outline on Edge.Cuts, place components strategically, route 2-layer copper traces, pour ground planes, and clear Design Rules Check (DRC).

Task 1 – Board Outline & Component Placement:
• Update PCB from Schematic (F8) in KiCad PCB Editor.
• Define a rectangular or custom board outline on the 'Edge.Cuts' layer using line and arc tools.
• Place connectors (USB, DC Jack, Terminal blocks) at the board edges.
• Arrange components to minimize trace crossing: keep decoupling caps within 2-3mm of IC pins.

Task 2 – 2-Layer Trace Routing:
• Set up Net Classes:
  - Signal Traces: width 0.25mm - 0.35mm.
  - Power Traces (VCC, 5V, 12V): width 0.6mm - 1.0mm to reduce trace resistance.
• Route high-speed and sensitive signals on the Top Copper layer (F.Cu).
• Use 45-degree angle bends for all trace corners (never use sharp 90-degree corners to prevent acid traps and impedance discontinuities).
• Use Vias (V shortcut) for transitioning traces between Top (F.Cu) and Bottom (B.Cu) layers.

Task 3 – Copper Pour Ground Planes (Zones):
• Draw a filled zone over the entire board on the Bottom Copper layer (B.Cu) assigned to GND.
• Observe thermal relief spokes on pads connecting to the ground plane to ensure ease of manual soldering.

Task 4 – Design Rules Check (DRC):
• Run Design Rules Check (DRC) with standard manufacturer tolerances (e.g., 6mil trace/clearance).
• Fix all clearance violations, unconnected nets, and courtyard overlaps.
• View your completed board in KiCad 3D Viewer (Alt+3).

Submission Requirements:
1. KiCad PCB layout file (.kicad_pcb)
2. 3D view render screenshot of the assembled board (top and perspective angle)
3. DRC verification report showing 0 errors and 0 unrouted nets`,
    videos: [
      {
        title: 'DigiKey PCB Layout Tutorial: Laying Out Your First PCB in KiCad',
        url: 'https://www.digikey.in/en/videos/d/digi-key-electronics/kicad-9-0-getting-started-part-6-laying-out-your-first-pcb-digikey',
        duration: '26:10'
      },
      {
        title: 'KiCad Trace Routing, Copper Zones & Design Rules Check (DRC)',
        url: 'https://www.youtube.com/watch?v=dfyv_S26Oa0',
        duration: '38:00'
      }
    ],
    resources: [
      {
        title: 'NE555 LED Flasher 2-Layer Layout Repository (GitHub)',
        url: 'https://github.com/KapHeir/ne555-led-flasher'
      },
      {
        title: '555 Timer PCB Design Complete 2-Layer Files (GitHub)',
        url: 'https://github.com/sitlesh/555-Timer-PCB-Design'
      }
    ],
    quiz_data: [
      {
        question: 'Why should trace bends on a PCB be routed at 45-degree angles rather than sharp 90-degree corners?',
        options: [
          'Because 90-degree corners look visually unappealing only',
          'Sharp 90-degree corners cause acid traps during etching and create high-frequency impedance discontinuities',
          'Because KiCad deletes 90-degree traces automatically',
          'Because copper wire cannot conduct at 90 degrees'
        ],
        correct_option: 1,
        answer: 'Sharp 90-degree corners cause acid traps during etching and create high-frequency impedance discontinuities'
      },
      {
        question: 'Which specific layer in KiCad defines the physical outer boundary and cuts of the printed circuit board?',
        options: [
          'F.Silkscreen',
          'F.Mask',
          'Edge.Cuts',
          'User.Drawings'
        ],
        correct_option: 2,
        answer: 'Edge.Cuts'
      },
      {
        question: 'What is a "Via" in multi-layer PCB design?',
        options: [
          'A screw used to mount the board inside an aluminum case',
          'A plated copper hole through the board that conducts electrical signals between different copper layers',
          'A software error code',
          'A type of surface-mount resistor'
        ],
        correct_option: 1,
        answer: 'A plated copper hole through the board that conducts electrical signals between different copper layers'
      },
      {
        question: 'Why are "thermal relief" pads used when connecting a pin to a large copper ground plane?',
        options: [
          'To insulate the pin from electricity',
          'To prevent the large copper plane from drawing away heat too rapidly during manual soldering',
          'To make the PCB lighter in weight',
          'To change the circuit frequency'
        ],
        correct_option: 1,
        answer: 'To prevent the large copper plane from drawing away heat too rapidly during manual soldering'
      },
      {
        question: 'What does Design Rules Check (DRC) verify in the PCB layout editor?',
        options: [
          'Whether the GitHub repository is public or private',
          'Whether the layout violates physical manufacturing constraints like minimum trace width, clearance, and drill sizes',
          'The retail price of the assembled board',
          'The internet speed of the computer'
        ],
        correct_option: 1,
        answer: 'Whether the layout violates physical manufacturing constraints like minimum trace width, clearance, and drill sizes'
      }
    ]
  },
  {
    id: 'pcb_mod_4',
    week_number: 4,
    title: 'Week 4 · Gerber Generation, BOM & Manufacturing Files Export',
    task_details: `Goal: Master the standard industrial PCB manufacturing workflow by plotting Gerber files, generating drill files, exporting the Bill of Materials (BOM), verifying layers in GerbView, and preparing the final submission package.

Task 1 – Generating Industrial Gerber Files (.gbr):
• In KiCad PCB Editor, navigate to File -> Plot.
• Select the essential manufacturing layers:
  - Copper Layers: F.Cu (Front Copper), B.Cu (Back Copper)
  - Solder Mask: F.Mask, B.Mask (protects traces from solder bridges)
  - Silkscreen: F.Silkscreen, B.Silkscreen (component labels and polarity markers)
  - Board Outline: Edge.Cuts
• Plot all selected layers into an output 'gerber/' folder.

Task 2 – Generating Excellon Drill Files (.drl):
• From the Plot window, click 'Generate Drill Files...'.
• Select Excellon format, Millimeters units, and PTH/NPTH separate files.
• Click 'Generate Drill File'.

Task 3 – Verification in KiCad Gerber Viewer (GerbView):
• Open GerbView from the KiCad launcher.
• Load all generated Gerber files and the drill file (.drl).
• Verify layer alignment, hole registrations, silkscreen legibility, and outline integrity.

Task 4 – Bill of Materials (BOM) Generation:
• Open Schematic Editor -> Tools -> Generate BOM.
• Export CSV with columns: Item, Reference, Value, Footprint, Quantity, Datasheet.

Task 5 – Final Project Documentation & DAKH Submission:
• Bundle your project files into a single ZIP archive following the official DAKH submission format.

Every student must submit:
1. Original KiCad schematic (.kicad_sch)
2. PCB layout (.kicad_pcb)
3. PCB 3D-view screenshot
4. ERC and DRC verification results
5. Gerber ZIP and BOM for completed PCB projects
6. Short explanation of circuit working (PDF or README)

Email to: dakhedusolutions@gmail.com
Subject: PCB Design Internship Submission – [Your Full Name] – [Intern ID]`,
    videos: [
      {
        title: 'Complete PCB Design to Gerber Tutorial: Exporting Manufacturing Files',
        url: 'https://www.youtube.com/watch?v=g3vxpdG1chs',
        duration: '24:45'
      },
      {
        title: 'LDR Sensor PCB Design, Gerber Output & Circuit Walkthrough',
        url: 'https://www.youtube.com/watch?v=dt0KDcHqgbA',
        duration: '18:30'
      }
    ],
    resources: [
      {
        title: 'Automatic Night Light KiCad Files (GitHub)',
        url: 'https://github.com/majzoub-alsiddig/automatic-night-light'
      },
      {
        title: 'KiCad Official Gerber Viewer (GerbView) Documentation',
        url: 'https://docs.kicad.org/10.0/en/gerbview/gerbview.html'
      }
    ],
    quiz_data: [
      {
        question: 'What is a Gerber file in printed circuit board fabrication?',
        options: [
          'A 3D CAD mesh file for printing plastic cases',
          'The standard vector format (RS-274X) that tells PCB manufacturing photoplotters where to apply copper, solder mask, and silkscreen',
          'An audio file explaining circuit design',
          'A proprietary Microsoft Excel spreadsheet'
        ],
        correct_option: 1,
        answer: 'The standard vector format (RS-274X) that tells PCB manufacturing photoplotters where to apply copper, solder mask, and silkscreen'
      },
      {
        question: 'What is the purpose of the Solder Mask (F.Mask / B.Mask) layer on a PCB?',
        options: [
          'To increase the electrical conductivity of all traces',
          'To cover and insulate copper traces, preventing accidental solder bridges and oxidation while leaving component pads exposed',
          'To make the board glow in the dark',
          'To attract electronic signals'
        ],
        correct_option: 1,
        answer: 'To cover and insulate copper traces, preventing accidental solder bridges and oxidation while leaving component pads exposed'
      },
      {
        question: 'What crucial information does an Excellon Drill File (.drl) provide to the PCB fabrication facility?',
        options: [
          'The weight of the shipping box',
          'The precise X-Y coordinates and tool diameters for all through-hole pins, vias, and mounting holes',
          'The resistor color codes',
          'The date the designer created the project'
        ],
        correct_option: 1,
        answer: 'The precise X-Y coordinates and tool diameters for all through-hole pins, vias, and mounting holes'
      },
      {
        question: 'What does BOM stand for in hardware electronics manufacturing?',
        options: [
          'Board Operating Manual',
          'Bill of Materials (the comprehensive parts list including designators, values, and footprints)',
          'Binary Object Model',
          'Base Output Metric'
        ],
        correct_option: 1,
        answer: 'Bill of Materials (the comprehensive parts list including designators, values, and footprints)'
      },
      {
        question: 'What is the function of the Silkscreen (F.SilkS / B.SilkS) layer?',
        options: [
          'To provide printed human-readable reference text (R1, C1, IC1), polarity markings (+/-), and company logos on the board',
          'To conduct high-voltage ground currents',
          'To drill holes through the substrate',
          'To insulate the battery'
        ],
        correct_option: 0,
        answer: 'To provide printed human-readable reference text (R1, C1, IC1), polarity markings (+/-), and company logos on the board'
      }
    ]
  }
];

export const PCB_OFFICIAL_RESOURCES = [
  {
    title: 'KiCad Getting Started Documentation',
    url: 'https://docs.kicad.org/10.0/en/getting_started_in_kicad/getting_started_in_kicad.html',
    category: 'Docs',
    desc: 'Official written guide covering KiCad schematic capture, footprint mapping, and board layout.'
  },
  {
    title: 'GitHub – Getting to Blinky (LED PCB)',
    url: 'https://github.com/pdnataraj/Getting-to-Blinky',
    category: 'GitHub',
    desc: 'Complete beginner LED blinking timing circuit PCB files and schematic.'
  },
  {
    title: 'Step-by-step Blinky PCB Tutorial',
    url: 'https://docs.twisted.hackclub.com/Hardware/Starter%20Projects/blinky/',
    category: 'Tutorial',
    desc: 'Interactive beginner hardware lab guide for soldering and routing Blinky PCB.'
  },
  {
    title: 'GitHub – Basic PCB Projects (7805 Supply)',
    url: 'https://github.com/niyathiarun/Basic-PCB-Projects',
    category: 'GitHub',
    desc: 'Repository with 5V regulated DC power supply PCB project and BOM.'
  },
  {
    title: 'YouTube – 7805 Regulator PCB KiCad Video',
    url: 'https://www.youtube.com/watch?v=M-mTjvak1LY',
    category: 'Video',
    desc: 'Dedicated video tutorial covering 7805 regulator schematic through routing.'
  },
  {
    title: 'GitHub – NE555 LED Flasher',
    url: 'https://github.com/KapHeir/ne555-led-flasher',
    category: 'GitHub',
    desc: 'Astable NE555 timer flasher schematic, layout, and Gerber files.'
  },
  {
    title: 'GitHub – 2-Layer Timer PCB Design',
    url: 'https://github.com/sitlesh/555-Timer-PCB-Design',
    category: 'GitHub',
    desc: 'Dual-layer timer circuit with ground copper pours and 3D preview.'
  },
  {
    title: 'YouTube – LDR Sensor PCB Design',
    url: 'https://www.youtube.com/watch?v=dt0KDcHqgbA',
    category: 'Video',
    desc: 'Step-by-step video tutorial for automatic night lamp PCB.'
  },
  {
    title: 'GitHub – Automatic Night Light KiCad Files',
    url: 'https://github.com/majzoub-alsiddig/automatic-night-light',
    category: 'GitHub',
    desc: 'LDR dark-activated switch PCB files with Gerber export.'
  }
];

export const PCB_SUBMISSION_FORMAT = [
  'Original KiCad schematic (.kicad_sch)',
  'PCB layout (.kicad_pcb)',
  'PCB 3D-view screenshot',
  'ERC and DRC verification results',
  'Gerber ZIP and BOM for completed PCB projects',
  'Short explanation of circuit working'
];
