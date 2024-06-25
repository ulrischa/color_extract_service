import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { writeFile } from 'fs/promises';
import * as Vibrant from 'node-vibrant';
import { Swatch, Palette } from 'node-vibrant/color';

function sortByPopulationDesc(obj: Palette): Palette {
  // Objekt in ein Array von Einträgen umwandeln
  const entries = Object.entries(obj);

  // Array nach _population absteigend sortieren
  entries.sort(([, a], [, b]) => b._population - a._population);

  // Sortiertes Array wieder in ein Objekt umwandeln
  const sortedObj = Object.fromEntries(entries);

  return sortedObj;
}

export const POST = async (req: NextRequest) => {
  // Parse the incoming form data
  const formData = await req.formData();

  // Get the file from the form data
  const file = formData.get('file');
  const url = formData.get('url');

  // Check if a file is received
  if (!file || !file.name) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  }

  // Convert the file data to a Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  // Replace spaces in the file name with underscores
  const filename = file.name.replaceAll(' ', '_');
  console.log(filename);

  try {
    // Write the file to the specified directory (public/uploads) with the modified filename
    const targetFilePath = path.join(
      process.cwd(),
      'public/uploads/' + filename
    );
    await writeFile(targetFilePath, buffer);

    // If URL is provided, validate and log it
    let validatedUrl = null;
    if (url && typeof url === 'string') {
      try {
        validatedUrl = new URL(url).toString();
        console.log(`URL provided: ${validatedUrl}`);
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid URL provided.' },
          { status: 400 }
        );
      }
    }

    //extract color
    let v = new Vibrant(targetFilePath);
    v.getPalette((err, palette) => {
      //console.log(palette);
      const sortedSwatches = sortByPopulationDesc(palette);
      console.log(sortedSwatches);
    });

    // Return a JSON response with a success message and a 201 status code
    return NextResponse.json(
      {
        message: 'Success',
        filePath: `/uploads/${filename}`,
        url: validatedUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    // If an error occurs during file writing, log the error and return a JSON response with a failure message and a 500 status code
    console.log('Error occurred ', error);
    return NextResponse.json({ message: 'Failed', error }, { status: 500 });
  }
};
