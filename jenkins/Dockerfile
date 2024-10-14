FROM jenkins/jenkins:lts

#root olmadan işletim sisteminde bir şey yükleyemiyoruz bu yüzden root olarak bağlanıyoruz jenkinse
USER root

#node js yükleme
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -  
RUN apt-get install -y nodejs

USER jenkins
# Güvenlik için en son jenkins kullanıcısına geçiş yapıyoruz. 

# docker build -t jenkins-nodejs .     ile Dockerfile dosyasını image'a çevirebiliriz
# docker run -p 8080:8080 -d -v jenkins-nodejs:/var/jenkins_home --restart unless-stopped jenkins-nodejs
