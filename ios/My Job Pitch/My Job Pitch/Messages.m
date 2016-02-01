//
//  Messages.m
//  My Job Pitch
//
//  Created by user on 31/01/2016.
//  Copyright © 2016 SC Labs Ltd. All rights reserved.
//

#import "Messages.h"
#import "MessageListCell.h"
#import "Message.h"
#import "Role.h"
#import "MessageThread.h"

@interface Messages ()

@end

@implementation Messages {
    NSArray *applications;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.messages.rowHeight = UITableViewAutomaticDimension;
    self.messages.estimatedRowHeight = 96;
    self.messages.dataSource = self;
    self.messages.delegate = self;
}

-(void)viewWillAppear:(BOOL)animated
{
    [self showProgress:true];
    [self.appDelegate.api loadApplications:^(NSArray *loadedApplications) {
        [self showProgress:false];
        self->applications = loadedApplications;
        [self.messages reloadData];
    } failure:^(RKObjectRequestOperation *operation, NSError *error, NSString *message, NSDictionary *errors) {
        [[[UIAlertView alloc] initWithTitle:@"Error"
                                    message:@"Error loading data"
                                   delegate:self
                          cancelButtonTitle:@"Okay"
                          otherButtonTitles:nil] show];
    }];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if (applications)
        return applications.count;
    return 0;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    MessageListCell *cell = [self.messages dequeueReusableCellWithIdentifier:@"MessageListCell"];
    Application *application = [self->applications objectAtIndex:indexPath.row];
    Message *lastMessage = [application.messages lastObject];
    if ([self.appDelegate.user isJobSeeker]) {
        cell.from.text = application.job.locationData.businessData.name;
        Image *image = [application.job getImage];
        if (image) {
            [self loadImageURL:image.thumbnail
                          into:cell.image
                 withIndicator:cell.imageActivity];
        } else {
            cell.image.image = nil;
        }
    } else {
        cell.from.text = [NSString stringWithFormat:@"%@ %@",
                          application.jobSeeker.firstName,
                          application.jobSeeker.lastName];
        Pitch *pitch = [application.jobSeeker getPitch];
        if (pitch) {
            [self loadImageURL:pitch.thumbnail
                          into:cell.image
                 withIndicator:cell.imageActivity];
        } else {
            cell.image.image = nil;
        }
    }
    
    cell.attributes.text = [NSString stringWithFormat:@"%@ (%@, %@)",
                            application.job.title,
                            application.job.locationData.name,
                            application.job.locationData.businessData.name];
    if ([lastMessage.fromRole isEqual:[self.appDelegate getUserRole].id]) {
        cell.message.text = [NSString stringWithFormat:@"You: %@", lastMessage.content];
    } else {
        cell.message.text = lastMessage.content;
    }
    cell.backgroundColor = [UIColor clearColor];
    cell.selectedBackgroundView = [[UIView alloc] init];
    cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:1.0 alpha:0.5];
    return cell;
}

- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    if ([[segue identifier] isEqualToString:@"goto_message_thread"]) {
        MessageThread *messageThreadView = [segue destinationViewController];
        Application *selectedApplication = [applications objectAtIndex:self.messages.indexPathForSelectedRow.row];
        [messageThreadView setApplication:selectedApplication];
    }
}

- (void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (buttonIndex == 1) {
        [self.navigationController popViewControllerAnimated:true];
    }
}

@end
