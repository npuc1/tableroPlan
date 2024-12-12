// AcusePDF.js
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Define styles for PDF layout
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF'
  },
  logo: {
    width: 200,
    height: 'auto'
  },
  title: {
    textAlign: 'right',
    marginTop: 30,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: 'bold'
  },
  subtitle: {
    textAlign: 'right',
    fontSize: 10,
    marginBottom: 20
  },
  date: {
    fontSize: 9,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10
  },
  paragraph: {
    fontSize: 9,
    marginBottom: 15,
    textAlign: 'justify'
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#dddddd'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd'
  },
  tableHeader: {
    backgroundColor: '#f8f8f8'
  },
  tableCell: {
    padding: 8,
    fontSize: 9
  },
  tableCellMain: {
    width: '75%',
    padding: 6,
    fontSize: 9
  },
  tableCellSecondary: {
    width: '25%',
    padding: 6,
    fontSize: 9
  },
  link: {
    color: '#0000EE',
    textDecoration: 'underline'
  },
  linkContainer: {
    flexDirection: 'column'
  }
});

function ensureHttps(url) {
  // If the URL already starts with http:// or https://, return it as is
  if (url.match(/^https?:\/\//)) {
    return url;
  }
  
  // If the URL starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // If the URL is a relative path or just a domain, add https://
  return `https://${url.replace(/^\/+/, '')}`;
}

// Create Document Component
const AcusePDF = ({ estado, datosEstado }) => {
  // Format the current date in Spanish
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Function to render institution section
  const renderInstitutionSection = ([sectionName, sectionData]) => {
    const criteriosConsiderados = Object.entries(sectionData)
      .filter(([_, value], index) => value === true && index >= 0 && index <= 11)
      .map(([field, _]) => `${field[0]}.${field[1]}`)
      .join(', ');

      const enlaces = Object.entries(sectionData)
      .filter(([field, value]) => field.startsWith("normLink") && value !== "")
      .map(([field, value]) => ({
        url: ensureHttps(value),
        text: `Acción 3.${field[8]}`
      }));

    return (
      <View style={styles.table} key={sectionName}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCellMain}>{sectionName}</Text>
          <Text style={styles.tableCellSecondary}>
            Reporte: {sectionData.reported ? 'Sí' : 'No'}
          </Text>
        </View>
        {sectionData.reported && criteriosConsiderados ? (
          <>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellMain}>Criterios considerados</Text>
              <Text style={styles.tableCellSecondary}>Enlaces</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellMain}>{criteriosConsiderados}</Text>
              <View style={[styles.tableCellSecondary, styles.linkContainer]}>
                {enlaces.map((enlace, index) => (
                  <Link
                    key={index}
                    style={styles.link}
                    src={enlace.url}
                  >
                    {enlace.text}
                  </Link>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '100%' }]}>
              {sectionData.reported
                ? 'Observación: La normatividad institucional no considera los criterios del Plan de Acción.'
                : 'NA'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image src="./SNA.png" style={styles.logo} />
        </View>
        
        <Text style={styles.title}>ACUSE DE REPORTE DE CUMPLIMIENTO</Text>
        <Text style={styles.subtitle}>
          PLAN DE ACCIÓN PARA FORTALECER LOS PROCESOS DE CONTRATACIONES PÚBLICAS EN MATERIA DE ADQUISICIONES,
          ARRENDAMIENTOS Y SERVICIOS DEL SECTOR PÚBLICO
        </Text>
        
        <Text style={styles.date}>Acuse generado el {currentDate}</Text>
        
        <Text style={styles.sectionTitle}>
          Sistema Estatal Anticorrupción de {estado}
        </Text>
        
        <Text style={styles.paragraph}>
          La emisión del presente acuse por parte de la Secretaría Ejecutiva del Sistema Nacional Anticorrupción
          atiende al reporte de información en el Tablero de Seguimiento a la Acción 3: "Homologar el marco estatal de
          contrataciones públicas, priorizando el fortalecimiento de la regulación relativa a excepciones para
          realizar contrataciones por vía de adjudicación directa" del Plan de Acción para fortalecer los procesos de
          contrataciones públicas en materia de adquisiciones, arrendamientos y servicios del sector público,
          consistente en los siguientes datos:
        </Text>

        {Object.entries(datosEstado).map(renderInstitutionSection)}
      </Page>
    </Document>
  );
};

export default AcusePDF;