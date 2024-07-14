const utilities = {

    returnBackgroundImages(url) {
        var part1 = "url('"
        var part2 = url
        var part3 = "') center/cover"
        return part1 + part2 + part3
      },
    returnDate(date){
        const dateObject = new Date(date);

        const year = dateObject.getFullYear();
        //const nameMonth = date.toLocaleString('default', { month: 'long' });
        const month = dateObject.getMonth();
        const day = dateObject.getDate();
        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const meses = [
          'janeiro',
          'fevereiro',
          'março',
          'abril',
          'maio',
          'junho',
          'julho',
          'agosto',
          'setembro',
          'outubro',
          'novembro',
          'dezembro',
        ];
        return `${day} de ${meses[month]} de ${year} às ${hours}:${minutes}`
    },
    bytesToMegabytes(bytes){
        const megabytes = bytes / (1024 * 1024);
        return megabytes.toFixed(2);
    }
}
export default utilities